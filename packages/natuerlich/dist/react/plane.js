/* eslint-disable react/display-name */
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { forwardRef } from "react";
import { Box2, Mesh, Shape, ShapeGeometry, Vector2, Vector3 } from "three";
import { SpaceGroup } from "./space.js";
import { useXR } from "./state.js";
import { shallow } from "zustand/shallow";
/**
 * @returns a function to trigger the room setup for webxr tracked planes
 */
export function useInitRoomCapture() {
    const session = useXR(({ session }) => session);
    return useMemo(() => session?.initiateRoomCapture.bind(session), [session]);
}
/**
 * @returns the planes that are currently tracked by webxr
 */
export function useTrackedPlanes() {
    return useXR((state) => state.trackedPlanes);
}
/**
 * @returns the planes tracked by webxr with the specified @param semanticLabel
 */
export function useTrackedObjectPlanes(semanticLabel) {
    return useXR((state) => state.trackedPlanes?.filter((plane) => plane.semanticLabel === semanticLabel), shallow);
}
const boxHelper = new Box2();
const sizeHelper = new Vector2();
function createGeometryFromPolygon(polygon) {
    const shape = new Shape();
    const points = polygon.map(({ x, z }) => new Vector2(x, z));
    //we measure the size and scale & unscale to have normalized UVs for the geometry
    boxHelper.setFromPoints(points);
    boxHelper.getSize(sizeHelper);
    for (const point of points) {
        point.sub(boxHelper.min);
        point.divide(sizeHelper);
    }
    shape.setFromPoints(points);
    const geometry = new ShapeGeometry(shape);
    geometry.scale(sizeHelper.x, sizeHelper.y, 1);
    geometry.translate(boxHelper.min.x, boxHelper.min.y, 0);
    geometry.rotateX(Math.PI / 2);
    return geometry;
}
function updateGeometry(geometry, lastUpdateRef, plane) {
    if (geometry != null &&
        lastUpdateRef.current != null &&
        lastUpdateRef.current >= plane.lastChangedTime) {
        return geometry;
    }
    lastUpdateRef.current = plane.lastChangedTime;
    return createGeometryFromPolygon(plane.polygon);
}
/**
 * component for positioning content (children) at the position of a tracked webxr plane
 */
export const TrackedPlane = forwardRef(({ plane, children, onFrame }, ref) => {
    return (React.createElement(SpaceGroup, { space: plane.planeSpace, initialPose: plane.initialPose, onFrame: onFrame, as: Mesh, ref: ref },
        React.createElement(TrackedPlaneGeometry, { plane: plane }),
        children));
});
const vectorHelper = new Vector3();
/**
 * computes the local bounding box of the plane and writes it into @param target
 */
export function measureXRPlane(plane, target) {
    target.makeEmpty();
    for (const { x, y, z } of plane.polygon) {
        target.expandByPoint(vectorHelper.set(x, y, z));
    }
    return target;
}
/**
 * @returns the geometry for a webxr plane
 * @param disposeBuffer specifies whether the buffers should be automatically cleaned up (default: true)
 */
export function useTrackedPlaneGeometry(plane, disposeBuffer = true) {
    const lastUpdateRef = useRef(undefined);
    const [geometry, setGeometry] = useState(updateGeometry(undefined, lastUpdateRef, plane));
    useFrame(() => setGeometry((geometry) => updateGeometry(geometry, lastUpdateRef, plane)));
    useEffect(() => {
        if (!disposeBuffer) {
            return;
        }
        return () => geometry?.dispose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geometry]);
    return geometry;
}
/**
 * component for rendering the geometry of a tracked webxr plane
 * Should be used together with a SpaceGroup
 */
export const TrackedPlaneGeometry = forwardRef(({ plane }, ref) => {
    const geometry = useTrackedPlaneGeometry(plane);
    useImperativeHandle(ref, () => geometry, [geometry]);
    return React.createElement("primitive", { object: geometry });
});
