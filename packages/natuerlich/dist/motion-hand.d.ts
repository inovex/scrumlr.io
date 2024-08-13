/// <reference types="webxr" resolution-mode="require"/>
import { Object3D } from "three";
export declare function getMotionHandModelUrl(handedness: string, basePath?: string, defaultProfileId?: string): string;
export type MotionHandBoneMap = Map<XRHandJoint, Object3D>;
export type MotionHand = Object3D & {
    boneMap: MotionHandBoneMap;
    hand: XRHand;
};
export declare function createMotionHand(hand: XRHand, object: Object3D): MotionHand;
export declare function isMotionHand(object: Object3D): object is MotionHand;
export declare function updateMotionHand(object: MotionHand, frame: XRFrame, referenceSpace: XRReferenceSpace): boolean;
