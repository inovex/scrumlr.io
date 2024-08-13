/* eslint-disable react/display-name */
import { useFrame } from "@react-three/fiber";
import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import { Group } from "three";
import { useXR } from "./state.js";
import { applyPose, applySpace } from "./space.js";
/**
 * component for positioning content (children) at the position of a tracked webxr image
 */
export const TrackedImage = forwardRef(({ onFrame, image, children }, ref) => {
    const group = useMemo(() => new Group(), []);
    const requestedImages = useXR(({ requestedTrackedImages }) => requestedTrackedImages);
    const imageIndex = useMemo(() => {
        if (requestedImages == null) {
            return undefined;
        }
        const index = requestedImages.findIndex(({ image: requestedImage }) => requestedImage === image);
        if (index === -1) {
            throw new Error(`Unknown image provided to TrackedImage. Images that should be tracked must be provided to "trackedImages" inside the XRSessionInit options`);
        }
        return index;
    }, [image, requestedImages]);
    const state = useXR.getState();
    const trackedImage = imageIndex == null ? undefined : state.trackedImages?.get(imageIndex);
    if (state.store != null && trackedImage?.initialPose != null) {
        applyPose(state.store.getState(), 0, undefined, group, trackedImage.initialPose, onFrame);
    }
    useFrame((state, delta, frame) => {
        if (imageIndex == null) {
            return;
        }
        const space = useXR.getState().trackedImages?.get(imageIndex)?.imageSpace;
        if (space == null) {
            return;
        }
        applySpace(state, delta, frame, group, space, onFrame);
    }, -10); //-10 so that we compute the space position before everybody else in the tree
    useImperativeHandle(ref, () => group, []);
    if (imageIndex == null) {
        return null;
    }
    return React.createElement("primitive", { object: group }, children);
});
