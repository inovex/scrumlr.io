/* eslint-disable react/display-name */
import { useFrame } from "@react-three/fiber";
import React, { forwardRef, useMemo } from "react";
import { useImperativeHandle } from "react";
import { Group, Object3D } from "three";
import { useXR } from "./state.js";
/**
 * hook to apply the transformation of a space onto an object
 * requires matrixAutoUpdate=false on the object
 * @param ref a reference to the object
 * @param space
 * @param onFrame callback executed every frame with the object to retrieve its worldMatrix f.e.
 */
export function useApplySpace(ref, space, initialPose, onFrame) {
    const state = useXR.getState();
    const object = ref instanceof Object3D ? ref : ref.current;
    if (object != null && state.store != null && initialPose != null) {
        applyPose(state.store.getState(), 0, undefined, object, initialPose, onFrame);
    }
    useFrame((rootState, delta, frame) => {
        const object = ref instanceof Object3D ? ref : ref.current;
        if (object == null) {
            return;
        }
        applySpace(rootState, delta, frame, object, space, onFrame);
    }, -10); //-10 so we render before the normal useFrames (which are at 0)
}
export function applySpace(state, delta, frame, object, space, onFrame) {
    const referenceSpace = state.gl.xr.getReferenceSpace();
    if (referenceSpace == null || frame == null) {
        object.visible = false;
        return;
    }
    const pose = frame.getPose(space, referenceSpace);
    applyPose(state, delta, frame, object, pose, onFrame);
}
export function applyPose(state, delta, frame, object, pose, onFrame) {
    if (pose == null) {
        object.visible = false;
        return;
    }
    object.visible = true;
    object.matrix.fromArray(pose.transform.matrix);
    if (onFrame != null) {
        object.updateMatrixWorld();
        onFrame(state, delta, frame, object);
    }
}
/**
 * component for positioning content (children) at the position of a tracked webxr space
 * the onFrame property allows to retrieve the object and its current matrixWorld transformation for every frame
 */
export const SpaceGroup = forwardRef(({ space, children, initialPose, onFrame, as = Group }, ref) => {
    const object = useMemo(() => {
        const g = new as();
        g.matrixAutoUpdate = false;
        return g;
    }, []);
    useImperativeHandle(ref, () => object, []);
    useApplySpace(object, space, initialPose, onFrame);
    return React.createElement("primitive", { object: object }, children);
});
