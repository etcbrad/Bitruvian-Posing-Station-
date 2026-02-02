

export type Vector2D = { x: number; y: number; };

export type MaskTransform = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

export type JointMode = 'standard' | 'bend' | 'stretch';

export type WalkingEnginePose = {
  waist: number;
  neck: number; 
  collar: number; 
  torso: number;
  l_shoulder: number; r_shoulder: number;
  l_elbow: number; r_elbow: number;
  l_hand: number; r_hand: number;
  l_hip: number; r_hip: number;
  l_knee: number; r_knee: number;
  l_foot: number; r_foot: number;
  l_toe: number; r_toe: number;
  stride_phase: number;
  y_offset: number;
  x_offset: number;
};

export type WalkingEnginePivotOffsets = {
  waist: number;
  neck: number; 
  collar: number; 
  torso: number;
  l_shoulder: number; r_shoulder: number;
  l_elbow: number; r_elbow: number;
  l_hand: number; r_hand: number;
  l_hip: number; r_hip: number;
  l_knee: number; r_knee: number;
  l_foot: number; r_foot: number;
  l_toe: number; r_toe: number;
};

export type WalkingEngineProportions = {
  head: { w: number; h: number };
  collar: { w: number; h: number };
  torso: { w: number; h: number };
  waist: { w: number; h: number };
  l_upper_arm: { w: number; h: number };
  l_lower_arm: { w: number; h: number };
  l_hand: { w: number; h: number };
  r_upper_arm: { w: number; h: number };
  r_lower_arm: { w: number; h: number };
  r_hand: { w: number; h: number };
  l_upper_leg: { w: number; h: number };
  l_lower_leg: { w: number; h: number };
  l_foot: { w: number; h: number };
  l_toe: { w: number; h: number };
  r_upper_leg: { w: number; h: number };
  r_lower_leg: { w: number; h: number };
  r_foot: { w: number; h: number };
  r_toe: { w: number; h: number };
};

export type IKChainKey = 'right_arm' | 'left_arm' | 'right_leg' | 'left_leg';

export interface FABRIKBone {
  key: keyof WalkingEnginePivotOffsets; // The bone's pivotOffsets key
  propKey: keyof WalkingEngineProportions; // The bone's proportion key
  rawH: number; // Raw anatomical height for length calculation
  parentOffsetAngle: number; // The fixed angle offset relative to parent's local axis (e.g., 90 for arms, 180 for legs)
}

export interface FABRIKChainConfig {
  bones: FABRIKBone[];
  rootParentPropKey: keyof WalkingEngineProportions; // The parent bone key where this IK chain attaches (e.g., 'collar' for arm)
  rootJointOffset: Vector2D; // Position offset of the chain's root joint from its parent's origin (e.g., shoulder joint offset from collar)
  rootParentRotationOffset: number; // The fixed rotation of the parent part that affects the first bone's base rotation (e.g., 90 or -90 for arms relative to collar)
  endEffectorBoneKey: keyof WalkingEnginePivotOffsets; // The pivotOffsets key of the end effector bone (e.g., 'r_hand')
  endEffectorPropKey: keyof WalkingEngineProportions; // The proportion key of the end effector (e.g., 'r_hand')
  endEffectorRawH: number; // Raw height of the end effector for its last segment length
}
