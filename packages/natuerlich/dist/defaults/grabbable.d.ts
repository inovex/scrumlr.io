import React, { ReactNode } from "react";
import { Object3D } from "three";
/**
 * component to make objects (its children) grabbable by one or two input sources (hands, controller, mouses, or via touch)
 */
export declare const Grabbable: React.ForwardRefExoticComponent<Omit<{
    onGrabbed?: ((object: Object3D) => void) | undefined;
    onReleased?: ((object: Object3D) => void) | undefined;
    /**
     * defines the maximum number of hands/controllers/touch-pointers/... that this grabbable can be touched by (reasonable values are 1,2)
     */
    maxGrabbers?: number | undefined;
    children?: ReactNode;
} & Omit<import("@react-three/fiber").ExtendedColors<import("@react-three/fiber").Overwrite<Partial<import("three").Group>, import("@react-three/fiber").NodeProps<import("three").Group, typeof import("three").Group>>>, import("@react-three/fiber").NonFunctionKeys<{
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
} & import("@react-three/fiber/dist/declarations/src/core/events.js").EventHandlers, "ref"> & React.RefAttributes<Object3D<import("three").Event>>>;
