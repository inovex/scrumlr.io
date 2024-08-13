/// <reference types="webxr" resolution-mode="require"/>
import React, { ReactNode } from "react";
import type { OculusHandModel } from "three/examples/jsm/webxr/OculusHandModel.js";
import { MotionHand } from "../motion-hand.js";
import { Group, Object3D } from "three";
/**
 * component for positioning content at a specific joint
 * needs to be placed inside a `DynamicHandModel` component
 */
export declare const HandBoneGroup: React.ForwardRefExoticComponent<{
    joint: XRHandJoint | Array<XRHandJoint>;
    rotationJoint?: XRHandJoint | undefined;
    children?: ReactNode;
} & React.RefAttributes<Group>>;
export declare function getBoneObject(motionHand: MotionHand, joint: XRHandJoint): Object3D<import("three").Event>;
/**
 * component for rendering a hand that is animated based on the joints in the hand
 */
export declare const DynamicHandModel: React.ForwardRefExoticComponent<{
    handedness: string;
    basePath?: string | undefined;
    defaultProfileId?: string | undefined;
    hand: XRHand;
    children?: ReactNode;
} & React.RefAttributes<Object3D<import("three").Event>>>;
export declare const StaticHandModel: React.ForwardRefExoticComponent<{
    handedness: string;
    basePath?: string | undefined;
    defaultProfileId?: string | undefined;
} & React.RefAttributes<OculusHandModel>>;
