/// <reference types="webxr" resolution-mode="require"/>
import React, { ReactNode } from "react";
import { Box3, BufferGeometry, Mesh } from "three";
import { OnFrameCallback } from "./space.js";
import { ExtendedXRPlane } from "./state.js";
/**
 * @returns a function to trigger the room setup for webxr tracked planes
 */
export declare function useInitRoomCapture(): (() => Promise<undefined>) | undefined;
/**
 * @returns the planes that are currently tracked by webxr
 */
export declare function useTrackedPlanes(): ReadonlyArray<ExtendedXRPlane> | undefined;
/**
 * @returns the planes tracked by webxr with the specified @param semanticLabel
 */
export declare function useTrackedObjectPlanes(semanticLabel: "desk" | "couch" | "floor" | "ceiling" | "wall" | "door" | "window" | "other" | string): ReadonlyArray<ExtendedXRPlane> | undefined;
/**
 * component for positioning content (children) at the position of a tracked webxr plane
 */
export declare const TrackedPlane: React.ForwardRefExoticComponent<{
    plane: ExtendedXRPlane;
    children?: ReactNode;
    onFrame?: OnFrameCallback | undefined;
} & React.RefAttributes<Mesh<BufferGeometry<import("three").NormalBufferAttributes>, import("three").Material | import("three").Material[]>>>;
/**
 * computes the local bounding box of the plane and writes it into @param target
 */
export declare function measureXRPlane(plane: XRPlane, target: Box3): Box3;
/**
 * @returns the geometry for a webxr plane
 * @param disposeBuffer specifies whether the buffers should be automatically cleaned up (default: true)
 */
export declare function useTrackedPlaneGeometry(plane: XRPlane, disposeBuffer?: boolean): BufferGeometry;
/**
 * component for rendering the geometry of a tracked webxr plane
 * Should be used together with a SpaceGroup
 */
export declare const TrackedPlaneGeometry: React.ForwardRefExoticComponent<{
    plane: XRPlane;
} & React.RefAttributes<BufferGeometry<import("three").NormalBufferAttributes>>>;
