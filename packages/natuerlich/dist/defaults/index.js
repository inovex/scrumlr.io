import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, } from "react";
import { AudioLoader, MeshBasicMaterial, Quaternion, Vector3, AudioListener, } from "three";
import { makeCursorMaterial, makeFadeMaterial } from "@coconut-xr/xmaterials";
import { useLoader, useThree } from "@react-three/fiber";
import React from "react";
//shared materials
export const CursorBasicMaterial = makeCursorMaterial(MeshBasicMaterial);
export const RayBasicMaterial = makeFadeMaterial(MeshBasicMaterial);
//shared update methods
const ZAXIS = new Vector3(0, 0, 1);
const quaternionHelper = new Quaternion();
const offsetHelper = new Vector3();
export function isTouchscreen(inputSource) {
    return inputSource.profiles.includes("generic-touchscreen");
}
export function updateCursorTransformation(inputSource, intersections, cursorRef, cursorOffset) {
    if (cursorRef.current == null) {
        return;
    }
    const cursor = cursorRef.current;
    if (intersections.length === 0) {
        cursor.visible = false;
        return;
    }
    cursor.visible = true;
    const intersection = intersections[0];
    cursor.position.copy(intersection.pointOnFace);
    if (intersection.face != null) {
        quaternionHelper.setFromUnitVectors(ZAXIS, intersection.face.normal);
        intersection.object.getWorldQuaternion(cursor.quaternion);
        cursor.quaternion.multiply(quaternionHelper);
        offsetHelper.set(0, 0, cursorOffset * (inputSource.handedness === "left" ? 1 : 1.5));
        offsetHelper.applyQuaternion(cursor.quaternion);
        cursor.position.add(offsetHelper);
    }
}
export function updateRayTransformation(intersections, maxLength, rayRef) {
    if (rayRef.current == null) {
        return;
    }
    let length = maxLength;
    if (intersections.length > 0) {
        length = Math.min(maxLength, intersections[0].distance);
    }
    rayRef.current.position.z = -length / 2;
    rayRef.current.scale.z = length;
}
export function triggerVibration(intersections, inputSource, refPrevIntersected) {
    const prevIntersected = refPrevIntersected.current;
    const currentIntersected = intersections.length > 0;
    refPrevIntersected.current = currentIntersected;
    if (!(!prevIntersected && currentIntersected)) {
        return;
    }
    if (inputSource.gamepad == null) {
        return;
    }
    const hapticActuators = inputSource.gamepad.hapticActuators;
    if (hapticActuators == null || hapticActuators.length === 0) {
        return;
    }
    hapticActuators[0].pulse(0.5, 30);
}
export function updateColor(pressed, material, normalColor, pressColor) {
    material.color.set(pressed ? pressColor : normalColor);
}
export function updateCursorDistanceOpacity(material, distance, smallestDistance, highestDistance, cursorOpacity) {
    const transition = Math.min(1.0, 1 - (distance - smallestDistance) / (highestDistance - smallestDistance));
    material.opacity = transition * cursorOpacity;
}
export const PositionalAudio = forwardRef(({ volume, url }, ref) => {
    const buffer = useLoader(AudioLoader, url);
    useImperativeHandle(ref, () => internalRef.current, []);
    const internalRef = useRef(null);
    const { camera } = useThree();
    const listener = useMemo(() => new AudioListener(), []);
    useEffect(() => {
        if (internalRef.current == null) {
            return;
        }
        internalRef.current.setBuffer(buffer);
        internalRef.current.setRefDistance(1);
        internalRef.current.setLoop(false);
        camera.add(listener);
        return () => void camera.remove(listener);
    }, [buffer, camera, listener]);
    useEffect(() => void internalRef.current?.setVolume(volume));
    return React.createElement("positionalAudio", { ref: internalRef, args: [listener] });
});
export * from "./canvas.js";
export * from "./grab-controller.js";
export * from "./grab-hand.js";
export * from "./pointer-controller.js";
export * from "./pointer-hand.js";
export * from "./touch-hand.js";
export * from "./teleport.js";
export * from "./koestlich.js";
export * from "./grabbable.js";
export * from "./controllers.js";
export * from "./hands.js";
