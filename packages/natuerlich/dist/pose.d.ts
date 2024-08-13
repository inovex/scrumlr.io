/// <reference types="webxr" resolution-mode="require"/>
export declare function updateHandMatrices(frame: XRFrame, referenceSpace: XRSpace, hand: XRHand, handMatrices: Float32Array): boolean;
export declare function computeHandPoseDistance(handMatrices: Float32Array, poseData: Float32Array, mirror: boolean): number;
export declare function storeHandData(handMatrices: Float32Array, mirror: boolean): Float32Array;
export declare function getHandPose(path: string, baseUrl: string): Float32Array | undefined;
