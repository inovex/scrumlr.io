import { useFrame } from "@react-three/fiber";
import { useCallback, useMemo, useRef } from "react";
import { computeHandPoseDistance, getHandPose, storeHandData as toPoseData, updateHandMatrices, } from "../index.js";
/**
 * @returns a function to download the current hand pose (left and right)
 * the poses fist, flat, horns, l, peace, point, relax, shaka, and thumb are provided by default
 * use in poseUrlMap as { pose: "{pose}.handpose" }
 * @param onPose callback executed every frame with the current and prevously detected poses and the offsetToOtherPoses of the current pose
 */
export function useHandPoses(hand, handedness, onPose, poseUrlMap, baseUrl = "https://coconut-xr.github.io/natuerlich/poses/") {
    const handMatrices = useMemo(() => new Float32Array(hand.size * 16), [hand.size]);
    const prevPoseName = useRef();
    const dumbRef = useRef(false);
    useFrame((state, _delta, frame) => {
        if (frame == null ||
            frame.session.visibilityState === "visible-blurred" ||
            frame.session.visibilityState === "hidden") {
            return;
        }
        const referenceSpace = state.gl.xr.getReferenceSpace();
        if (referenceSpace == null) {
            return;
        }
        const validPose = updateHandMatrices(frame, referenceSpace, hand, handMatrices);
        if (!validPose) {
            return;
        }
        if (dumbRef.current) {
            downloadPoseData(toPoseData(handMatrices, handedness === "left"));
            dumbRef.current = false;
        }
        let bestPoseName;
        let bestPoseDistance;
        let bestPoseOffset;
        for (const [name, path] of Object.entries(poseUrlMap)) {
            const pose = getHandPose(path, baseUrl);
            if (pose == null) {
                continue;
            }
            const distance = computeHandPoseDistance(handMatrices, pose, handedness === "left");
            if (bestPoseDistance == null || distance < bestPoseDistance) {
                bestPoseOffset = bestPoseDistance == null ? Infinity : bestPoseDistance - distance;
                bestPoseDistance = distance;
                bestPoseName = name;
            }
            else if (bestPoseOffset != null) {
                bestPoseOffset = Math.min(bestPoseOffset, distance - bestPoseDistance);
            }
        }
        if (bestPoseName == null || bestPoseOffset == null) {
            return;
        }
        onPose(bestPoseName, prevPoseName.current, bestPoseOffset);
        prevPoseName.current = bestPoseName;
    });
    return useCallback(() => (dumbRef.current = true), []);
}
function downloadPoseData(pose) {
    const a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([new Uint8Array(pose.buffer)], { type: "application/octet-stream" }));
    a.download = "untitled.handpose";
    // Append anchor to body.
    document.body.appendChild(a);
    a.click();
    // Remove anchor from body
    document.body.removeChild(a);
}
