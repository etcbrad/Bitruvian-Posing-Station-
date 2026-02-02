import { Vector2D, WalkingEnginePivotOffsets, WalkingEngineProportions, FABRIKChainConfig } from '../types';
import { ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT } from '../constants';

// --- Vector Math Helpers ---
const addVec = (v1: Vector2D, v2: Vector2D): Vector2D => ({ x: v1.x + v2.x, y: v1.y + v2.y });
const subVec = (v1: Vector2D, v2: Vector2D): Vector2D => ({ x: v1.x - v2.x, y: v1.y - v2.y });
const distSq = (v1: Vector2D, v2: Vector2D): number => (v1.x - v2.x)**2 + (v1.y - v2.y)**2;
const dist = (v1: Vector2D, v2: Vector2D): number => Math.sqrt(distSq(v1, v2));
const normalizeVec = (v: Vector2D): Vector2D => {
    const d = Math.sqrt(v.x*v.x + v.y*v.y);
    return d > 0 ? { x: v.x / d, y: v.y / d } : { x: 0, y: 0 };
};
const scaleVec = (v: Vector2D, s: number): Vector2D => ({ x: v.x * s, y: v.y * s });
const rotateVec = (vec: Vector2D, angleDeg: number): Vector2D => {
    const r = angleDeg * Math.PI / 180;
    const c = Math.cos(r);
    const s = Math.sin(r);
    return { x: vec.x * c - vec.y * s, y: vec.x * s + vec.y * c };
};

// Calculates the angle (in degrees) of a vector relative to the positive Y-axis (downwards in SVG).
// 0 degrees is pointing down, 90 is pointing left, -90 (or 270) is pointing right.
const getAngleFromVector = (vec: Vector2D): number => {
    return Math.atan2(vec.y, vec.x) * 180 / Math.PI + 90; // Adjust for Y-down and 0 being down
};


/**
 * Solves Inverse Kinematics for a given chain of bones using the FABRIK algorithm.
 * This function calculates the new local rotations (pivotOffsets) for the bones
 * in the chain to reach a specified target position for the end-effector.
 * 
 * @param chainConfig Defines the structure of the bone chain (keys, raw lengths, parent offsets).
 * @param currentPivotOffsets The current local rotation offsets of all bones.
 * @param props The current proportions of all body parts.
 * @param baseUnitH The base unit height for scaling anatomical dimensions.
 * @param rootWorldPos The world-space position of the root joint of the IK chain (p[0]).
 * @param rootWorldRot The world-space rotation of the parent of the first bone in the chain. This is the angle used to orient the first bone.
 * @param targetWorldPos The desired world-space position for the end-effector.
 * @param maxIterations Maximum iterations for the FABRIK solver.
 * @param tolerance Distance threshold for convergence.
 * @returns A new WalkingEnginePivotOffsets object with updated rotations for the IK chain.
 */
export function solveFABRIK(
    chainConfig: FABRIKChainConfig,
    currentPivotOffsets: WalkingEnginePivotOffsets,
    props: WalkingEngineProportions,
    baseUnitH: number,
    rootWorldPos: Vector2D, // World position of the joint *before* the first bone in the chain
    rootWorldRot: number, // World rotation of the parent of the first bone in the chain
    targetWorldPos: Vector2D,
    maxIterations: number = 20,
    tolerance: number = 1, // pixels
): WalkingEnginePivotOffsets {
    const newPivotOffsets = { ...currentPivotOffsets };

    // 1. Calculate bone lengths and initial world joint positions for the chain
    const boneLengths: number[] = [];
    const initialJointWorldPositions: Vector2D[] = [rootWorldPos]; // p[0] is the root of the IK chain

    let accumulatedWorldRotation = rootWorldRot; // World rotation of the joint *before* the first bone

    chainConfig.bones.forEach((bone, i) => {
        const boneLength = bone.rawH * baseUnitH * (props[bone.propKey]?.h || 1);
        boneLengths.push(boneLength);

        // This bone's local rotation is its pivotOffset.
        const localPivotRotation = (currentPivotOffsets[bone.key] || 0);
        
        // The world rotation of the bone itself.
        // It's the accumulated parent rotation + local pivot + parentOffsetAngle (e.g., 180 for legs)
        const boneWorldRotation = accumulatedWorldRotation + localPivotRotation + bone.parentOffsetAngle;
        
        const jointEndPos = addVec(initialJointWorldPositions[i], rotateVec({ x: 0, y: boneLength }, boneWorldRotation));
        initialJointWorldPositions.push(jointEndPos);
        accumulatedWorldRotation = boneWorldRotation; // For the next bone, this bone's world rotation is the parent's effective rotation.
    });

    // Add the end-effector length for the final segment
    const endEffectorLength = chainConfig.endEffectorRawH * baseUnitH * (props[chainConfig.endEffectorPropKey]?.h || 1);
    boneLengths.push(endEffectorLength);
    const endEffectorTipWorldPos = addVec(initialJointWorldPositions[initialJointWorldPositions.length -1], rotateVec({x:0, y:endEffectorLength}, accumulatedWorldRotation));
    initialJointWorldPositions.push(endEffectorTipWorldPos);


    const numSegments = boneLengths.length;
    const numJoints = initialJointWorldPositions.length; // p[0...n]
    
    const baseJointPosition = initialJointWorldPositions[0]; // B
    const effectorWorldPosition = initialJointWorldPositions[numJoints - 1]; // Pn
    const totalChainLength = boneLengths.reduce((sum, l) => sum + l, 0);

    // If target is unreachable
    if (dist(baseJointPosition, targetWorldPos) > totalChainLength) {
        // Stretch the arm fully towards the target
        const currentP = [...initialJointWorldPositions];
        currentP[0] = baseJointPosition;
        for (let i = 0; i < numSegments; i++) {
            const jointToTarget = subVec(targetWorldPos, currentP[i]);
            const normalizedJointToTarget = normalizeVec(jointToTarget);
            currentP[i+1] = addVec(currentP[i], scaleVec(normalizedJointToTarget, boneLengths[i]));
        }
        return convertWorldPositionsToLocalRotations(chainConfig, newPivotOffsets, currentP, baseJointPosition, rootWorldRot);
    }

    // Initialize the working array of joint positions for FABRIK
    const currentP = [...initialJointWorldPositions];

    // Iterative solving
    let delta = dist(currentP[numJoints - 1], targetWorldPos); // Distance from current end-effector to target

    let iteration = 0;
    while (delta > tolerance && iteration < maxIterations) {
        // Stage 1: Forward Reaching (from end-effector to base)
        currentP[numJoints - 1] = targetWorldPos; // Set end-effector to target
        for (let i = numJoints - 2; i >= 0; i--) { // Iterate from Pn-1 down to P0
            const currentBoneLength = boneLengths[i]; // Bone from P[i] to P[i+1]
            const currentDistance = dist(currentP[i+1], currentP[i]);
            if (currentDistance === 0) {
                 // Avoid division by zero if joints overlap, just skip or nudge
                continue;
            }
            const lambda = currentBoneLength / currentDistance;
            currentP[i] = addVec(scaleVec(currentP[i+1], 1 - lambda), scaleVec(currentP[i], lambda));
        }

        // Stage 2: Backward Reaching (from base to end-effector)
        currentP[0] = baseJointPosition; // Re-anchor the base joint
        for (let i = 0; i < numJoints - 1; i++) { // Iterate from P0 up to Pn-1
            const currentBoneLength = boneLengths[i];
            const currentDistance = dist(currentP[i+1], currentP[i]);
            if (currentDistance === 0) {
                continue;
            }
            const lambda = currentBoneLength / currentDistance;
            currentP[i+1] = addVec(scaleVec(currentP[i], 1 - lambda), scaleVec(currentP[i+1], lambda));
        }

        delta = dist(currentP[numJoints - 1], targetWorldPos);
        iteration++;
    }

    // 2. Convert final world joint positions back to local rotations (pivotOffsets)
    return convertWorldPositionsToLocalRotations(chainConfig, newPivotOffsets, currentP, baseJointPosition, rootWorldRot);
}

// Helper to convert final world joint positions back to local pivotOffsets
function convertWorldPositionsToLocalRotations(
    chainConfig: FABRIKChainConfig,
    basePivotOffsets: WalkingEnginePivotOffsets,
    finalJointWorldPositions: Vector2D[], // p[0...n] after FABRIK
    rootWorldPos: Vector2D, // p[0]
    rootWorldRot: number, // World rotation of the parent of p[0]
): WalkingEnginePivotOffsets {
    const updatedPivotOffsets = { ...basePivotOffsets };

    let currentAccumulatedWorldRotation = rootWorldRot; // World rotation of the joint *before* the current bone

    chainConfig.bones.forEach((bone, i) => {
        const currentJointPos = finalJointWorldPositions[i];
        const nextJointPos = finalJointWorldPositions[i+1];

        // Vector representing the bone itself in world space
        const boneVector = subVec(nextJointPos, currentJointPos);
        const boneWorldRotation = getAngleFromVector(boneVector);

        // The local rotation (pivotOffset) is calculated by subtracting:
        // 1. The accumulated world rotation of the parent joint
        // 2. The fixed parent offset angle for this bone
        const localPivotRotation = boneWorldRotation - currentAccumulatedWorldRotation - bone.parentOffsetAngle;
        
        updatedPivotOffsets[bone.key] = localPivotRotation;

        // For the next bone, this bone's effective world rotation (including its fixed offset) becomes the new accumulated parent rotation
        currentAccumulatedWorldRotation = boneWorldRotation;
    });

    return updatedPivotOffsets;
}
