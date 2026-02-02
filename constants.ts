

// ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT: These are the proportions of each part
// relative to a single BASE_HEAD_UNIT (typically H=150 in App context).
export const ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT = {
  HEAD: 0.75,
  HEAD_WIDTH: (2 / 3) * 0.5,
  HEAD_NECK_GAP_OFFSET: 0.1,
  COLLAR: 0.4,
  COLLAR_WIDTH: (2 / 3),
  TORSO: 1.2,
  TORSO_WIDTH: 0.65,
  WAIST: 1.0,
  WAIST_WIDTH: 0.85,
  UPPER_ARM: 1.8,
  LOWER_ARM: 1.4,
  HAND: 0.8,
  LEG_UPPER: 2.2,
  LEG_LOWER: 1.8,
  FOOT: 0.64,
  TOE: 0.36,
  SHOULDER_WIDTH: 1.2,
  HIP_WIDTH: 1.0,
  LIMB_WIDTH_ARM: 0.22,
  LIMB_WIDTH_FOREARM: 0.18,
  LIMB_WIDTH_THIGH: 0.35,
  LIMB_WIDTH_CALF: 0.28,
  HAND_WIDTH: 0.2,
  FOOT_WIDTH: 0.25,
  TOE_WIDTH: 0.25,
};

// RIGGING values reference ANATOMY proportions directly.
export const RIGGING = {
  L_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER: -ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR_WIDTH / 2.1,
  R_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR_WIDTH / 2.1,
  SHOULDER_Y_OFFSET_FROM_COLLAR_END: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR,
  COLLAR_OFFSET_Y: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR * 0.15,
};

export const GROUND_STRIP_HEIGHT_RAW_H_UNIT = 0.4;


// IK Chain Configurations for FABRIK
import { FABRIKChainConfig } from './types';

export const RIGHT_ARM_IK_CONFIG: FABRIKChainConfig = {
  bones: [
    { key: 'r_shoulder', propKey: 'r_upper_arm', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.UPPER_ARM, parentOffsetAngle: -90 }, // Shoulder rotates -90 deg from collar's Y-axis to point right
    { key: 'r_elbow', propKey: 'r_lower_arm', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LOWER_ARM, parentOffsetAngle: 0 },
    { key: 'r_hand', propKey: 'r_hand', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND, parentOffsetAngle: 0 },
  ],
  rootParentPropKey: 'collar',
  rootJointOffset: { x: RIGGING.R_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER, y: -ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR }, // Shoulder joint from collar's origin (end)
  rootParentRotationOffset: 0, // Collar's rotation is its global rotation
  endEffectorBoneKey: 'r_hand',
  endEffectorPropKey: 'r_hand',
  endEffectorRawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND,
};

export const RIGHT_LEG_IK_CONFIG: FABRIKChainConfig = {
  bones: [
    { key: 'r_hip', propKey: 'r_upper_leg', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_UPPER, parentOffsetAngle: 180 }, // Hip rotates 180 deg from waist's Y-axis to point down
    { key: 'r_knee', propKey: 'r_lower_leg', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_LOWER, parentOffsetAngle: 0 },
    { key: 'r_foot', propKey: 'r_foot', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT, parentOffsetAngle: 0 },
  ],
  rootParentPropKey: 'waist',
  rootJointOffset: { x: 0, y: 0 }, // Hip joint is at waist's origin
  rootParentRotationOffset: 0, // Waist's rotation is its global rotation
  endEffectorBoneKey: 'r_foot',
  endEffectorPropKey: 'r_foot',
  endEffectorRawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT,
};

export const LEFT_ARM_IK_CONFIG: FABRIKChainConfig = {
  bones: [
    { key: 'l_shoulder', propKey: 'l_upper_arm', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.UPPER_ARM, parentOffsetAngle: 90 }, // Shoulder rotates 90 deg from collar's Y-axis to point left
    { key: 'l_elbow', propKey: 'l_lower_arm', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LOWER_ARM, parentOffsetAngle: 0 },
    { key: 'l_hand', propKey: 'l_hand', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND, parentOffsetAngle: 0 },
  ],
  rootParentPropKey: 'collar',
  rootJointOffset: { x: RIGGING.L_SHOULDER_X_OFFSET_FROM_COLLAR_CENTER, y: -ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.COLLAR }, // Shoulder joint from collar's origin (end)
  rootParentRotationOffset: 0, // Collar's rotation is its global rotation
  endEffectorBoneKey: 'l_hand',
  endEffectorPropKey: 'l_hand',
  endEffectorRawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.HAND,
};

export const LEFT_LEG_IK_CONFIG: FABRIKChainConfig = {
  bones: [
    { key: 'l_hip', propKey: 'l_upper_leg', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_UPPER, parentOffsetAngle: 180 }, // Hip rotates 180 deg from waist's Y-axis to point down
    { key: 'l_knee', propKey: 'l_lower_leg', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.LEG_LOWER, parentOffsetAngle: 0 },
    { key: 'l_foot', propKey: 'l_foot', rawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT, parentOffsetAngle: 0 },
  ],
  rootParentPropKey: 'waist',
  rootJointOffset: { x: 0, y: 0 }, // Hip joint is at waist's origin
  rootParentRotationOffset: 0, // Waist's rotation is its global rotation
  endEffectorBoneKey: 'l_foot',
  endEffectorPropKey: 'l_foot',
  endEffectorRawH: ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT.FOOT,
};
