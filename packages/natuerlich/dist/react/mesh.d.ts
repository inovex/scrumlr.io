/// <reference types="webxr" resolution-mode="require"/>
import React, { ReactNode } from "react";
import { Box3, BufferGeometry, Mesh } from "three";
import { OnFrameCallback } from "./space.js";
import { ExtendedXRMesh } from "./state.js";
/**
 * @returns the meshes that are currently tracked by webxr
 */
export declare function useTrackedMeshes(): ReadonlyArray<ExtendedXRMesh> | undefined;
/**
 * @returns the meshes tracked by webxr with the specified @param semanticLabel
 */
export declare function useTrackedObjectMeshes(semanticLabel: "desk" | "couch" | "floor" | "ceiling" | "wall" | "door" | "window" | "other" | string): ReadonlyArray<ExtendedXRMesh> | undefined;
/**
 * component for rendering a tracked webxr mesh and placing content (children) at the tracked mesh position
 */
export declare const TrackedMesh: React.ForwardRefExoticComponent<{
    mesh: ExtendedXRMesh;
    children?: ReactNode;
    onFrame?: OnFrameCallback | undefined;
} & React.RefAttributes<Mesh<BufferGeometry<import("three").NormalBufferAttributes>, import("three").Material | import("three").Material[]>>>;
/**
 * computes the local bounding box of the mesh and writes it into @param target
 */
export declare function measureXRMesh(mesh: XRMesh, target: Box3): Box3;
/**
 * @returns the geometry for a webxr mesh
 * @param disposeBuffer specifies whether the buffers should be automatically cleaned up (default: true)
 */
export declare function useTrackedMeshGeometry(mesh: XRMesh, disposeBuffer?: boolean): BufferGeometry;
/**
 * component for rendering the geometry of a tracked webxr mesh
 * Should be used together with a SpaceGroup
 */
export declare const TrackedMeshGeometry: React.ForwardRefExoticComponent<{
    mesh: XRMesh;
} & React.RefAttributes<BufferGeometry<import("three").NormalBufferAttributes>>>;
