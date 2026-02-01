

import React, { useMemo, useCallback } from 'react';
import { Bone } from './Bone';
import { ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT, RIGGING } from '../constants';
import { WalkingEnginePose, WalkingEngineProportions, WalkingEnginePivotOffsets, Vector2D, MaskTransform, JointMode } from '../types';

interface MannequinProps {
  pose: WalkingEnginePose;
  pivotOffsets: WalkingEnginePivotOffsets & { l_hand_flash?: boolean; r_hand_flash?: boolean };
  props: WalkingEngineProportions;
  showPivots: boolean;
  showLabels: boolean;
  baseUnitH: number;
  onAnchorMouseDown: (boneKey: keyof WalkingEnginePivotOffsets, clientX: number) => void;
  draggingBoneKey: keyof WalkingEnginePivotOffsets | null;
  isPaused: boolean;
  pinningMode: 'none' | 'rightFoot' | 'dual';
  maskImage?: string | null;
  maskTransform?: MaskTransform;
  offset: Vector2D;
  isReversed?: boolean;
  jointModes?: Record<keyof WalkingEnginePivotOffsets, JointMode>;
}

const RENDER_ORDER: (keyof WalkingEngineProportions)[] = [
    'waist', 'torso', 'l_upper_leg', 'r_upper_leg', 'l_lower_leg', 'r_lower_leg', 'l_foot', 'r_foot', 'l_toe', 'r_toe', 
    'collar', 'head', 'l_upper_arm', 'r_upper_arm', 'l_lower_arm', 'r_lower_arm', 'l_hand', 'r_hand'
];

const partDefinitions: Record<keyof WalkingEngineProportions, any> = {
    head: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HEAD, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HEAD_WIDTH, variant: 'head-tall-oval', drawsUpwards: true, label: 'Head', boneKey: 'neck' },
    collar: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR_WIDTH, variant: 'collar-horizontal-oval-shape', drawsUpwards: true, label: 'Collar', boneKey: 'collar' },
    torso: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.TORSO, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.TORSO_WIDTH, variant: 'torso-teardrop-pointy-down', drawsUpwards: true, label: 'Upper Body', boneKey: 'torso' },
    waist: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.WAIST, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.WAIST_WIDTH, variant: 'waist-teardrop-pointy-up', drawsUpwards: true, label: 'Lower Body', boneKey: 'waist' },
    r_upper_arm: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.UPPER_ARM, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_ARM, variant: 'deltoid-shape', label: 'Shoulder', boneKey: 'r_shoulder' },
    r_lower_arm: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LOWER_ARM, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_FOREARM, variant: 'limb-tapered', label: 'Forearm', boneKey: 'r_elbow' },
    r_hand: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND_WIDTH, variant: 'hand-foot-arrowhead-shape', label: 'Hand', boneKey: 'r_hand' },
    l_upper_arm: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.UPPER_ARM, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_ARM, variant: 'deltoid-shape', label: 'Shoulder', boneKey: 'l_shoulder' },
    l_lower_arm: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LOWER_ARM, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_FOREARM, variant: 'limb-tapered', label: 'Forearm', boneKey: 'l_elbow' },
    l_hand: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND_WIDTH, variant: 'hand-foot-arrowhead-shape', label: 'Hand', boneKey: 'l_hand' },
    r_upper_leg: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_UPPER, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_THIGH, variant: 'limb-tapered', label: 'Thigh', boneKey: 'r_hip' },
    r_lower_leg: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_LOWER, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_CALF, variant: 'limb-tapered', label: 'Calf', boneKey: 'r_knee' },
    r_foot: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT_WIDTH, variant: 'foot-block-shape', label: 'Foot', boneKey: 'r_foot' },
    r_toe: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.TOE, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.TOE_WIDTH, variant: 'toe-rounded-cap', label: 'Toe', boneKey: 'r_toe' },
    l_upper_leg: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_UPPER, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_THIGH, variant: 'limb-tapered', label: 'Thigh', boneKey: 'l_hip' },
    l_lower_leg: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_LOWER, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LIMB_WIDTH_CALF, variant: 'limb-tapered', label: 'Calf', boneKey: 'l_knee' },
    l_foot: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT_WIDTH, variant: 'foot-block-shape', label: 'Foot', boneKey: 'l_foot' },
    l_toe: { rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.TOE, rawW: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.TOE_WIDTH, variant: 'toe-rounded-cap', label: 'Toe', boneKey: 'l_toe' },
};

const rotateVec = (vec: Vector2D, angleDeg: number): Vector2D => {
  const r = angleDeg * Math.PI / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: vec.x * c - vec.y * s, y: vec.x * s + vec.y * c };
};
const addVec = (v1: Vector2D, v2: Vector2D): Vector2D => ({ x: v1.x + v2.x, y: v1.y + v2.y });

export const Mannequin: React.FC<MannequinProps> = ({
  pose, pivotOffsets, props, showPivots, showLabels, baseUnitH,
  onAnchorMouseDown, draggingBoneKey, isPaused, pinningMode,
  maskImage, maskTransform, offset, isReversed, jointModes
}) => {
    const getScaledDimension = useCallback((raw: number, key: keyof WalkingEngineProportions, axis: 'w' | 'h') => {
        return raw * baseUnitH * (props[key]?.[axis] || 1);
    }, [props, baseUnitH]);

    // Fix: Use only pivotOffsets for joint rotations, as it is the dynamic state.
    // The `pose` prop is treated as a base or for other attributes not currently used for rotations.
    const calculateJointRotation = (boneKey: string, parentRot: number) => {
        const local = ((pivotOffsets as any)[boneKey] || 0);
        const mode = jointModes?.[boneKey as keyof WalkingEnginePivotOffsets] || 'standard';
        
        switch(mode) {
            case 'bend': return parentRot + (local * 1.5); // Exaggerates local rotation for a more pronounced bend
            case 'stretch': return parentRot + (local * 0.5); // Reduces local rotation's influence, making it straighter
            default: return parentRot + local; // Standard FK
        }
    };

    const globalTransforms = useMemo(() => {
        const trans: Partial<Record<keyof WalkingEngineProportions, { position: Vector2D; rotation: number }>> = {};
        
        if (!isReversed) {
            // --- Standard Hierarchy (Waist as Root) ---
            const waistLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.WAIST, 'waist', 'h');
            const waistRot = calculateJointRotation('waist', 0);
            trans.waist = { position: { x: 0, y: 0 }, rotation: waistRot };

            const torsoLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.TORSO, 'torso', 'h');
            const torsoRot = calculateJointRotation('torso', waistRot);
            trans.torso = { position: addVec(trans.waist.position, rotateVec({ x: 0, y: -waistLen }, waistRot)), rotation: torsoRot };

            const collarLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR, 'collar', 'h');
            const collarRot = calculateJointRotation('collar', torsoRot);
            trans.collar = { position: addVec(trans.torso.position, rotateVec({ x: 0, y: -torsoLen }, torsoRot)), rotation: collarRot };
            
            const neckRot = calculateJointRotation('neck', collarRot);
            trans.head = { position: addVec(trans.collar.position, rotateVec({ x: 0, y: -collarLen }, collarRot)), rotation: neckRot };

            // Arms and Legs follow collar and waist respectively
            ['r', 'l'].forEach(side => {
                const sx = (side === 'r' ? RIGGING.R_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER : RIGGING.L_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER) * baseUnitH;
                // Arms are children of collar, their initial orientation is side-ways from collar's perspective
                const shRot = calculateJointRotation(`${side}_shoulder`, collarRot + (side === 'l' ? 90 : -90)); 
                const collarEnd = addVec(trans.collar!.position, rotateVec({ x: 0, y: -collarLen }, collarRot));
                const shPos = addVec(collarEnd, rotateVec({ x: sx, y: 0 }, collarRot));
                trans[`${side}_upper_arm` as keyof WalkingEngineProportions] = { position: shPos, rotation: shRot };
                const upLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.UPPER_ARM, `${side}_upper_arm` as any, 'h');
                const elRot = calculateJointRotation(`${side}_elbow`, shRot);
                const elPos = addVec(shPos, rotateVec({ x: 0, y: upLen }, shRot));
                trans[`${side}_lower_arm` as keyof WalkingEngineProportions] = { position: elPos, rotation: elRot };
                const lowLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LOWER_ARM, `${side}_lower_arm` as any, 'h');
                const handRot = calculateJointRotation(`${side}_hand`, elRot);
                trans[`${side}_hand` as keyof WalkingEngineProportions] = { position: addVec(elPos, rotateVec({ x: 0, y: lowLen }, elRot)), rotation: handRot };
            });

            ['r', 'l'].forEach(side => {
                // Legs start pointing downwards from the waist. Add 180 to hip rotation.
                const hipRot = calculateJointRotation(`${side}_hip`, waistRot + 180); 
                trans[`${side}_upper_leg` as keyof WalkingEngineProportions] = { position: trans.waist!.position, rotation: hipRot };
                const thighLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_UPPER, `${side}_upper_leg` as any, 'h');
                const kneeRot = calculateJointRotation(`${side}_knee`, hipRot);
                const kneePos = addVec(trans.waist!.position, rotateVec({ x: 0, y: thighLen }, hipRot));
                trans[`${side}_lower_leg` as keyof WalkingEngineProportions] = { position: kneePos, rotation: kneeRot };
                const calfLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_LOWER, `${side}_lower_leg` as any, 'h');
                const ankleRot = calculateJointRotation(`${side}_foot`, kneeRot);
                const anklePos = addVec(kneePos, rotateVec({ x: 0, y: calfLen }, kneeRot));
                trans[`${side}_foot` as keyof WalkingEngineProportions] = { position: anklePos, rotation: ankleRot };
                const footLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT, `${side}_foot` as any, 'h');
                const toeRot = calculateJointRotation(`${side}_toe`, ankleRot);
                trans[`${side}_toe` as keyof WalkingEngineProportions] = { position: addVec(anklePos, rotateVec({ x: 0, y: footLen }, ankleRot)), rotation: toeRot };
            });
        } else {
            // --- Reversed Hierarchy (Head as Root) ---
            const neckRot = calculateJointRotation('neck', 0);
            trans.head = { position: { x: 0, y: 0 }, rotation: neckRot };
            
            const collarLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR, 'collar', 'h');
            const collarRot = calculateJointRotation('collar', neckRot);
            trans.collar = { position: addVec(trans.head.position, rotateVec({ x: 0, y: collarLen }, neckRot)), rotation: collarRot };
            
            const torsoLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.TORSO, 'torso', 'h');
            const torsoRot = calculateJointRotation('torso', collarRot);
            trans.torso = { position: addVec(trans.collar.position, rotateVec({ x: 0, y: collarLen }, collarRot)), rotation: torsoRot };
            
            const waistLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.WAIST, 'waist', 'h');
            const waistRot = calculateJointRotation('waist', torsoRot);
            trans.waist = { position: addVec(trans.torso.position, rotateVec({ x: 0, y: torsoLen }, torsoRot)), rotation: waistRot };

            // Arms and Legs follow the chain down
            ['r', 'l'].forEach(side => {
                const sx = (side === 'r' ? RIGGING.R_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER : RIGGING.L_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER) * baseUnitH;
                const shRot = calculateJointRotation(`${side}_shoulder`, collarRot + (side === 'l' ? 90 : -90));
                const shPos = addVec(trans.collar!.position, rotateVec({ x: sx, y: 0 }, collarRot));
                trans[`${side}_upper_arm` as keyof WalkingEngineProportions] = { position: shPos, rotation: shRot };
                const upLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.UPPER_ARM, `${side}_upper_arm` as any, 'h');
                const elRot = calculateJointRotation(`${side}_elbow`, shRot);
                const elPos = addVec(shPos, rotateVec({ x: 0, y: upLen }, shRot));
                trans[`${side}_lower_arm` as keyof WalkingEngineProportions] = { position: elPos, rotation: elRot };
                const lowLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LOWER_ARM, `${side}_lower_arm` as any, 'h');
                const handRot = calculateJointRotation(`${side}_hand`, elRot);
                trans[`${side}_hand` as keyof WalkingEngineProportions] = { position: addVec(elPos, rotateVec({ x: 0, y: lowLen }, elRot)), rotation: handRot };
            });

            ['r', 'l'].forEach(side => {
                const hipRot = calculateJointRotation(`${side}_hip`, waistRot + 180); // Legs point downwards from waist in reversed mode too
                trans[`${side}_upper_leg` as keyof WalkingEngineProportions] = { position: trans.waist!.position, rotation: hipRot };
                const thighLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_UPPER, `${side}_upper_leg` as any, 'h');
                const kneeRot = calculateJointRotation(`${side}_knee`, hipRot);
                const kneePos = addVec(trans.waist!.position, rotateVec({ x: 0, y: thighLen }, hipRot));
                trans[`${side}_lower_leg` as keyof WalkingEngineProportions] = { position: kneePos, rotation: kneeRot };
                const calfLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_LOWER, `${side}_lower_leg` as any, 'h');
                const ankleRot = calculateJointRotation(`${side}_foot`, kneeRot);
                const anklePos = addVec(kneePos, rotateVec({ x: 0, y: calfLen }, kneeRot));
                trans[`${side}_foot` as keyof WalkingEngineProportions] = { position: anklePos, rotation: ankleRot };
                const footLen = getScaledDimension(ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT, `${side}_foot` as any, 'h');
                const toeRot = calculateJointRotation(`${side}_toe`, ankleRot);
                trans[`${side}_toe` as keyof WalkingEngineProportions] = { position: addVec(anklePos, rotateVec({ x: 0, y: footLen }, ankleRot)), rotation: toeRot };
            });
        }

        return trans;
    }, [pivotOffsets, getScaledDimension, baseUnitH, isReversed, jointModes]); // Changed `pose` to `pivotOffsets` in dependencies

    return (
        <g>
            {RENDER_ORDER.map(partKey => {
                const p = partDefinitions[partKey];
                const t = globalTransforms[partKey];
                if (!p || !t) return null;

                const colorClass = (partKey === 'collar') ? 'fill-olive' : 
                                  (partKey === 'l_hand' && pivotOffsets.l_hand_flash) ? 'fill-accent-red' : 
                                  (partKey === 'r_hand' && pivotOffsets.r_hand_flash) ? 'fill-accent-red' : 'fill-mono-dark';

                return (
                    <g key={partKey} transform={`translate(${t.position.x}, ${t.position.y}) rotate(${t.rotation})`}>
                        <Bone 
                            rotation={0}
                            length={getScaledDimension(p.rawH, partKey, 'h')}
                            width={getScaledDimension(p.rawW, partKey, 'w')}
                            variant={p.variant}
                            drawsUpwards={p.drawsUpwards}
                            label={p.label}
                            boneKey={p.boneKey}
                            proportionKey={partKey}
                            showPivots={showPivots}
                            showLabel={showLabels}
                            onAnchorMouseDown={onAnchorMouseDown}
                            isBeingDragged={draggingBoneKey === p.boneKey}
                            isPausedAndPivotsVisible={true} 
                            colorClass={colorClass}
                            isPinned={pinningMode === 'rightFoot' && partKey === 'r_foot'}
                        />
                    </g>
                );
            })}
        </g>
    );
};