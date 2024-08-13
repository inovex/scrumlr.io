import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Quaternion, Vector3 } from "three";
import React from "react";
const vectorHelper = new Vector3();
const directionHelper = new Vector3();
const guardPosition = new Vector3();
const guardQuaternion = new Quaternion();
export function useIsFacingCamera(ref, set, direction, angle) {
    const camera = useThree((state) => state.camera);
    useFrame(() => {
        if (ref.current == null) {
            return;
        }
        //compute object world direction -> directionHelper
        ref.current.getWorldQuaternion(guardQuaternion);
        directionHelper.copy(direction).applyQuaternion(guardQuaternion);
        //compute guardToCamera direction (guard - camera) -> vectorHelper
        ref.current.getWorldPosition(guardPosition);
        camera.getWorldPosition(vectorHelper);
        vectorHelper.sub(guardPosition);
        //compute the angle between guardToCamera and object world direction
        set(vectorHelper.angleTo(directionHelper) < angle / 2);
    });
}
/**
 * guard that detects if the camera is faced and makes content visible based on the provided angle
 */
export function VisibilityFacingCameraGuard({ children, direction, angle = Math.PI / 2, }) {
    const ref = useRef(null);
    useIsFacingCamera(ref, (visible) => {
        if (ref.current == null) {
            return;
        }
        ref.current.visible = visible;
    }, direction, angle);
    return React.createElement("group", { ref: ref }, children);
}
/**
 * guard that detects if the camera is faced and includes content based on the provided angle
 */
export function FacingCameraGuard({ children, direction, angle = Math.PI / 2, }) {
    const ref = useRef(null);
    const [show, setShow] = useState(false);
    useIsFacingCamera(ref, setShow, direction, angle);
    return show ? React.createElement(React.Fragment, null, children) : null;
}
