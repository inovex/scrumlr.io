/* eslint-disable react/display-name */
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { forwardRef } from "react";
import { BufferAttribute, BufferGeometry, Mesh, Vector3 } from "three";
import { SpaceGroup } from "./space.js";
import { useXR } from "./state.js";
import { shallow } from "zustand/shallow";
/**
 * @returns the meshes that are currently tracked by webxr
 */
export function useTrackedMeshes() {
    return useXR((state) => state.trackedMeshes);
}
/**
 * @returns the meshes tracked by webxr with the specified @param semanticLabel
 */
export function useTrackedObjectMeshes(semanticLabel) {
    return useXR((state) => state.trackedMeshes?.filter((mesh) => mesh.semanticLabel === semanticLabel), shallow);
}
function updateGeometry(geometry, lastUpdateRef, mesh) {
    if (geometry != null &&
        lastUpdateRef.current != null &&
        lastUpdateRef.current >= mesh.lastChangedTime) {
        return geometry;
    }
    lastUpdateRef.current = mesh.lastChangedTime;
    const newGeometry = new BufferGeometry();
    newGeometry.setIndex(new BufferAttribute(mesh.indices, 1));
    newGeometry.setAttribute("position", new BufferAttribute(mesh.vertices, 3));
    return newGeometry;
}
/**
 * component for rendering a tracked webxr mesh and placing content (children) at the tracked mesh position
 */
export const TrackedMesh = forwardRef(({ mesh, children, onFrame }, ref) => {
    return (React.createElement(SpaceGroup, { space: mesh.meshSpace, initialPose: mesh.initialPose, as: Mesh, onFrame: onFrame, ref: ref },
        React.createElement(TrackedMeshGeometry, { mesh: mesh }),
        children));
});
const vectorHelper = new Vector3();
/**
 * computes the local bounding box of the mesh and writes it into @param target
 */
export function measureXRMesh(mesh, target) {
    const length = mesh.vertices.length;
    target.makeEmpty();
    for (let i = 0; i < length; i += 3) {
        vectorHelper.fromArray(mesh.vertices, i);
        target.expandByPoint(vectorHelper);
    }
    return target;
}
/**
 * @returns the geometry for a webxr mesh
 * @param disposeBuffer specifies whether the buffers should be automatically cleaned up (default: true)
 */
export function useTrackedMeshGeometry(mesh, disposeBuffer = true) {
    const lastUpdateRef = useRef(undefined);
    const [geometry, setGeometry] = useState(updateGeometry(undefined, lastUpdateRef, mesh));
    useFrame(() => setGeometry((geometry) => updateGeometry(geometry, lastUpdateRef, mesh)));
    useEffect(() => {
        if (!disposeBuffer) {
            return;
        }
        return () => geometry.dispose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geometry]);
    return geometry;
}
/**
 * component for rendering the geometry of a tracked webxr mesh
 * Should be used together with a SpaceGroup
 */
export const TrackedMeshGeometry = forwardRef(({ mesh }, ref) => {
    const geometry = useTrackedMeshGeometry(mesh);
    useImperativeHandle(ref, () => geometry, []);
    return React.createElement("primitive", { object: geometry });
});
