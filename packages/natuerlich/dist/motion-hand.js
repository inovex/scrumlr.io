import { DEFAULT_PROFILES_PATH } from "./index.js";
//from https://github.com/pmndrs/three-stdlib/blob/main/src/webxr/XRHandMeshModel.ts
const DEFAULT_HAND_PROFILE = "generic-hand";
const joints = [
    "wrist",
    "thumb-metacarpal",
    "thumb-phalanx-proximal",
    "thumb-phalanx-distal",
    "thumb-tip",
    "index-finger-metacarpal",
    "index-finger-phalanx-proximal",
    "index-finger-phalanx-intermediate",
    "index-finger-phalanx-distal",
    "index-finger-tip",
    "middle-finger-metacarpal",
    "middle-finger-phalanx-proximal",
    "middle-finger-phalanx-intermediate",
    "middle-finger-phalanx-distal",
    "middle-finger-tip",
    "ring-finger-metacarpal",
    "ring-finger-phalanx-proximal",
    "ring-finger-phalanx-intermediate",
    "ring-finger-phalanx-distal",
    "ring-finger-tip",
    "pinky-finger-metacarpal",
    "pinky-finger-phalanx-proximal",
    "pinky-finger-phalanx-intermediate",
    "pinky-finger-phalanx-distal",
    "pinky-finger-tip",
];
export function getMotionHandModelUrl(handedness, basePath = DEFAULT_PROFILES_PATH, defaultProfileId = DEFAULT_HAND_PROFILE) {
    return `${basePath}/${defaultProfileId}/${handedness}.glb`;
}
export function createMotionHand(hand, object) {
    const mesh = object.getObjectByProperty("type", "SkinnedMesh");
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const boneMap = new Map();
    for (const jointName of joints) {
        const bone = object.getObjectByName(jointName);
        if (bone == null) {
            continue;
        }
        boneMap.set(jointName, bone);
    }
    return Object.assign(object, { boneMap, hand });
}
export function isMotionHand(object) {
    return "boneMap" in object;
}
export function updateMotionHand(object, frame, referenceSpace) {
    let poseValid = true;
    for (const inputJoint of object.hand.values()) {
        const bone = object.boneMap.get(inputJoint.jointName);
        if (bone == null) {
            continue;
        }
        const jointPose = frame.getJointPose?.(inputJoint, referenceSpace);
        if (jointPose != null) {
            const { position, orientation } = jointPose.transform;
            bone.position.set(position.x, position.y, position.z);
            bone.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
            continue;
        }
        if (inputJoint.jointName === "wrist") {
            poseValid = false;
            break; //wrist is untracked => everything else is unuseable
        }
    }
    return poseValid;
}
