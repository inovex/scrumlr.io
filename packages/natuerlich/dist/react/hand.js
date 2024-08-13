/* eslint-disable react/display-name */
import { useLoader, useFrame } from "@react-three/fiber";
import React, { forwardRef, useMemo, useRef, useImperativeHandle } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { getMotionHandModelUrl, createMotionHand, updateMotionHand, isMotionHand, } from "../motion-hand.js";
/**
 * component for positioning content at a specific joint
 * needs to be placed inside a `DynamicHandModel` component
 */
export const HandBoneGroup = forwardRef(({ joint, rotationJoint, children }, ref) => {
    const internalRef = useRef(null);
    useFrame(() => {
        if (internalRef.current == null) {
            return;
        }
        const motionHand = internalRef.current.parent;
        if (motionHand == null || !isMotionHand(motionHand)) {
            throw new Error(`HandBoneGroup can only be placed directly under DynamicHandModel`);
        }
        const bone = Array.isArray(joint)
            ? joint.map(getBoneObject.bind(null, motionHand))
            : getBoneObject(motionHand, joint);
        if (Array.isArray(bone)) {
            internalRef.current.position.set(0, 0, 0);
            for (const object of bone) {
                internalRef.current.position.add(object.position);
            }
            internalRef.current.position.divideScalar(bone.length);
        }
        else {
            internalRef.current.position.copy(bone.position);
        }
        const rotationBone = rotationJoint == null ? bone : motionHand.boneMap.get(rotationJoint);
        if (rotationBone == null) {
            throw new Error(`unknown joint "${rotationJoint}" in ${motionHand.boneMap}`);
        }
        if (Array.isArray(rotationBone)) {
            throw new Error(`multiple rotation joints are not implemented`);
        }
        else {
            internalRef.current.quaternion.copy(rotationBone.quaternion);
        }
    });
    useImperativeHandle(ref, () => internalRef.current, []);
    return React.createElement("group", { ref: internalRef }, children);
});
export function getBoneObject(motionHand, joint) {
    const bone = motionHand.boneMap.get(joint);
    if (bone == null) {
        throw new Error(`unknown joint "${joint}" in ${motionHand.boneMap}`);
    }
    return bone;
}
/**
 * component for rendering a hand that is animated based on the joints in the hand
 */
export const DynamicHandModel = forwardRef(({ children, handedness, basePath, defaultProfileId, hand }, ref) => {
    const url = getMotionHandModelUrl(handedness, basePath, defaultProfileId);
    const { scene } = useLoader(GLTFLoader, url);
    const clonedScene = useMemo(() => cloneSkeleton(scene), [scene]);
    const motionHand = useMemo(() => createMotionHand(hand, clonedScene), [clonedScene, hand]);
    useFrame((state, delta, frame) => {
        if (frame == null ||
            frame.session.visibilityState === "hidden" ||
            frame.session.visibilityState === "visible-blurred") {
            motionHand.visible = false;
            return;
        }
        const referenceSpace = state.gl.xr.getReferenceSpace();
        if (referenceSpace == null) {
            motionHand.visible = false;
            return;
        }
        const poseValid = updateMotionHand(motionHand, frame, referenceSpace);
        motionHand.visible = poseValid;
    });
    useImperativeHandle(ref, () => motionHand.boneMap.get("wrist"), []);
    return React.createElement("primitive", { object: motionHand }, children);
});
export const StaticHandModel = forwardRef(({ handedness, basePath, defaultProfileId }, ref) => {
    const { scene } = useLoader(GLTFLoader, getMotionHandModelUrl(handedness, basePath, defaultProfileId));
    const clonedScene = useMemo(() => cloneSkeleton(scene), [scene]);
    return React.createElement("primitive", { ref: ref, object: clonedScene });
});
