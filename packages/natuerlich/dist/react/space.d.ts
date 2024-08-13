/// <reference types="webxr" resolution-mode="require"/>
import { RootState } from "@react-three/fiber";
import React, { ReactNode, RefObject } from "react";
import { Object3D } from "three";
/**
 * hook to apply the transformation of a space onto an object
 * requires matrixAutoUpdate=false on the object
 * @param ref a reference to the object
 * @param space
 * @param onFrame callback executed every frame with the object to retrieve its worldMatrix f.e.
 */
export declare function useApplySpace(ref: RefObject<Object3D> | Object3D, space: XRSpace, initialPose?: XRPose, onFrame?: OnFrameCallback): void;
export declare function applySpace(state: RootState, delta: number, frame: XRFrame | undefined, object: Object3D, space: XRSpace, onFrame?: (rootState: RootState, delta: number, frame: XRFrame | undefined, object: Object3D) => void): void;
export type OnFrameCallback = (rootState: RootState, delta: number, frame: XRFrame | undefined, object: Object3D) => void;
export declare function applyPose(state: RootState, delta: number, frame: XRFrame | undefined, object: Object3D, pose: XRPose | undefined, onFrame?: OnFrameCallback): void;
/**
 * component for positioning content (children) at the position of a tracked webxr space
 * the onFrame property allows to retrieve the object and its current matrixWorld transformation for every frame
 */
export declare const SpaceGroup: React.ForwardRefExoticComponent<{
    space: XRSpace;
    initialPose?: XRPose | undefined;
    children?: ReactNode;
    onFrame?: OnFrameCallback | undefined;
    as?: (new () => Object3D) | undefined;
} & React.RefAttributes<Object3D<import("three").Event>>>;
