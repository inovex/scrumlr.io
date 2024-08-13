import React from "react";
import { Group } from "three";
import { OnFrameCallback } from "./space.js";
/**
 * component for positioning content (children) at the position of a tracked webxr image
 */
export declare const TrackedImage: React.ForwardRefExoticComponent<Omit<{
    image: ImageBitmap;
    onFrame?: OnFrameCallback | undefined;
} & Omit<import("@react-three/fiber").ExtendedColors<import("@react-three/fiber").Overwrite<Partial<Group>, import("@react-three/fiber").NodeProps<Group, typeof Group>>>, import("@react-three/fiber").NonFunctionKeys<{
    position?: import("@react-three/fiber").Vector3 | undefined;
    up?: import("@react-three/fiber").Vector3 | undefined;
    scale?: import("@react-three/fiber").Vector3 | undefined;
    rotation?: import("@react-three/fiber").Euler | undefined;
    matrix?: import("@react-three/fiber").Matrix4 | undefined;
    quaternion?: import("@react-three/fiber").Quaternion | undefined;
    layers?: import("@react-three/fiber").Layers | undefined;
    dispose?: (() => void) | null | undefined;
}>> & {
    position?: import("@react-three/fiber").Vector3 | undefined;
    up?: import("@react-three/fiber").Vector3 | undefined;
    scale?: import("@react-three/fiber").Vector3 | undefined;
    rotation?: import("@react-three/fiber").Euler | undefined;
    matrix?: import("@react-three/fiber").Matrix4 | undefined;
    quaternion?: import("@react-three/fiber").Quaternion | undefined;
    layers?: import("@react-three/fiber").Layers | undefined;
    dispose?: (() => void) | null | undefined;
} & import("@react-three/fiber/dist/declarations/src/core/events.js").EventHandlers, "ref"> & React.RefAttributes<Group>>;
