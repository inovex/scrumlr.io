/// <reference types="webxr" resolution-mode="require"/>
/**
 * @returns a function to download the current hand pose (left and right)
 * the poses fist, flat, horns, l, peace, point, relax, shaka, and thumb are provided by default
 * use in poseUrlMap as { pose: "{pose}.handpose" }
 * @param onPose callback executed every frame with the current and prevously detected poses and the offsetToOtherPoses of the current pose
 */
export declare function useHandPoses(hand: XRHand, handedness: XRHandedness, onPose: (name: string, prevName: string | undefined, offsetToOtherPoses: number) => void, poseUrlMap: Record<string, string>, baseUrl?: string): () => void;
