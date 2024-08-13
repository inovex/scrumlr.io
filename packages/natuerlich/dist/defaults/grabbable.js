/* eslint-disable react/display-name */
import { isXIntersection } from "@coconut-xr/xinteraction";
import { useFrame, createPortal, useThree } from "@react-three/fiber";
import React, { useMemo, useEffect, forwardRef } from "react";
import { useImperativeHandle } from "react";
import { Vector3, Quaternion, Object3D } from "three";
const pointOffsetPosition = new Vector3();
const deltaRotation = new Quaternion();
const initialInputDeviceOffset = new Vector3();
const currentInputDeviceOffset = new Vector3();
function setupGrabbable(attachPoint, properties) {
    const object = new Object3D();
    const state = {
        intersections: new Map(),
        objectPosition: new Vector3(),
        objectRotation: new Quaternion(),
        objectScale: new Vector3(),
    };
    const updateObjectMatrix = () => {
        object.updateWorldMatrix(true, false);
        object.matrixWorld.decompose(state.objectPosition, state.objectRotation, state.objectScale);
        for (const intersection of state.intersections.values()) {
            intersection.startPosition = intersection.currentPosition;
            intersection.startRotation = intersection.currentRotation;
        }
    };
    return {
        object,
        onUpOrLeave: (e) => {
            e.stopPropagation();
            if (!state.intersections.delete(e.pointerId)) {
                //just left without grabbing
                return;
            }
            if (state.intersections.size > 0) {
                updateObjectMatrix();
                return;
            }
            //not grabbed anymore, attach to normal three tree
            attachPoint.attach(object);
            properties.onReleased?.(object);
        },
        onDown: (e) => {
            if (!isXIntersection(e)) {
                return;
            }
            const currentIntersectionSize = state.intersections.size;
            if (currentIntersectionSize >= properties.maxGrabbers || currentIntersectionSize >= 2) {
                return;
            }
            e.stopPropagation();
            e.target.setPointerCapture(e.pointerId);
            updateObjectMatrix();
            state.intersections.set(e.pointerId, {
                startPosition: e.point,
                currentPosition: e.point,
                startRotation: e.inputDeviceRotation,
                currentRotation: e.inputDeviceRotation,
            });
            if (state.intersections.size != 1) {
                return;
            }
            properties.onGrabbed?.(object);
            properties.scene.add(object);
        },
        onMove: (e) => {
            if (!isXIntersection(e)) {
                return;
            }
            const intersection = state.intersections.get(e.pointerId);
            if (intersection == null) {
                return;
            }
            intersection.currentPosition = e.point;
            intersection.currentRotation = e.inputDeviceRotation;
        },
        onFrame: () => {
            switch (state.intersections.size) {
                case 1: {
                    const [{ currentPosition, currentRotation, startPosition, startRotation }] = state.intersections.values();
                    //compute offset from point to object
                    pointOffsetPosition.copy(state.objectPosition).sub(startPosition);
                    //compute delta rotation
                    deltaRotation.copy(startRotation).invert().premultiply(currentRotation);
                    //calculate new position using the offset from the initial intersection point to the object
                    //then rotating this offset by the rotation offset of the input source
                    //and lastly add the initial position of the box
                    object.position
                        .copy(pointOffsetPosition)
                        .applyQuaternion(deltaRotation)
                        .add(currentPosition);
                    //calculating the new rotation by applying the offset rotation of the input source to the original rotation of the box
                    object.quaternion.copy(deltaRotation).multiply(state.objectRotation); //1. object rotation then add deltaRotation
                    object.scale.copy(state.objectScale);
                    break;
                }
                case 2: {
                    const [i1, i2] = state.intersections.values();
                    //initial and current input source offset from 1 to 2
                    initialInputDeviceOffset.copy(i2.startPosition).sub(i1.startPosition);
                    currentInputDeviceOffset.copy(i2.currentPosition).sub(i1.currentPosition);
                    //compute scale scalar
                    const initialLength = initialInputDeviceOffset.length();
                    const currentLength = currentInputDeviceOffset.length();
                    const deltaScale = currentLength / initialLength;
                    //normalize vectors
                    initialInputDeviceOffset.divideScalar(initialLength);
                    currentInputDeviceOffset.divideScalar(currentLength);
                    //compute quaternion
                    deltaRotation.setFromUnitVectors(initialInputDeviceOffset, currentInputDeviceOffset);
                    object.position
                        .copy(state.objectPosition)
                        .sub(i1.startPosition)
                        .multiplyScalar(deltaScale)
                        .applyQuaternion(deltaRotation)
                        .add(i1.currentPosition);
                    object.quaternion.copy(deltaRotation).multiply(state.objectRotation);
                    object.scale.copy(state.objectScale).multiplyScalar(deltaScale);
                    break;
                }
            }
        },
    };
}
/**
 * component to make objects (its children) grabbable by one or two input sources (hands, controller, mouses, or via touch)
 */
export const Grabbable = forwardRef(({ children, maxGrabbers = 2, onGrabbed, onReleased, ...props }, ref) => {
    const scene = useThree(({ scene }) => scene);
    const properties = useMemo(() => ({ maxGrabbers, onReleased, onGrabbed, scene }), []);
    properties.onGrabbed = onGrabbed;
    properties.onReleased = onReleased;
    properties.scene = scene;
    properties.maxGrabbers = maxGrabbers;
    const attachPoint = useMemo(() => new Object3D(), []);
    const { object, onDown, onFrame, onMove, onUpOrLeave } = useMemo(() => setupGrabbable(attachPoint, properties), []);
    useImperativeHandle(ref, () => object, []);
    useFrame(onFrame);
    useEffect(() => void attachPoint.add(object), []);
    return (React.createElement(React.Fragment, null,
        React.createElement("primitive", { object: attachPoint }),
        createPortal(React.createElement("group", { onPointerDown: onDown, onPointerEnter: stopPropagation, onPointerUp: onUpOrLeave, onPointerLeave: onUpOrLeave, onPointerMove: onMove, ...props }, children), object)));
});
function stopPropagation(e) {
    e.stopPropagation();
}
