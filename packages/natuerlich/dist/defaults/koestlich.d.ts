import React from "react";
import { Object3D, OrthographicCamera } from "three";
/**
 * combines WebXR quad layer with a Koestlich root container
 */
export declare const KoestlichQuadLayer: React.ForwardRefExoticComponent<Omit<Omit<Omit<Omit<import("@react-three/fiber").ExtendedColors<import("@react-three/fiber").Overwrite<Partial<import("three").Group>, import("@react-three/fiber").NodeProps<import("three").Group, typeof import("three").Group>>>, import("@react-three/fiber").NonFunctionKeys<{
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
} & import("@react-three/fiber/dist/declarations/src/core/events.js").EventHandlers & {
    texture?: import("three").Texture | undefined;
    updateTarget?: ((renderer: import("three").WebGLRenderer, target: import("three").WebGLRenderTarget) => void) | undefined;
    pixelWidth: number;
    pixelHeight: number;
    colorFormat?: number | undefined;
    depthFormat?: number | undefined;
    index?: number | undefined;
    transparent?: boolean | undefined;
    geometry?: import("three").BufferGeometry<import("three").NormalBufferAttributes> | undefined;
}, "ref"> & React.RefAttributes<Object3D<import("three").Event>>, "ref">, "texture" | "updateTarget"> & {
    far?: number | undefined;
    near?: number | undefined;
    precision?: number | undefined;
} & React.RefAttributes<Object3D<import("three").Event>>>;
/**
 * combines WebXR cylinder layer with a Koestlich root container
 */
export declare const KoestlichCylinderLayer: React.ForwardRefExoticComponent<Omit<Omit<Omit<Omit<import("@react-three/fiber").ExtendedColors<import("@react-three/fiber").Overwrite<Partial<import("three").Group>, import("@react-three/fiber").NodeProps<import("three").Group, typeof import("three").Group>>>, import("@react-three/fiber").NonFunctionKeys<{
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
} & import("@react-three/fiber/dist/declarations/src/core/events.js").EventHandlers & {
    texture?: import("three").Texture | undefined;
    updateTarget?: ((renderer: import("three").WebGLRenderer, target: import("three").WebGLRenderTarget) => void) | undefined;
    pixelWidth: number;
    pixelHeight: number;
    colorFormat?: number | undefined;
    depthFormat?: number | undefined;
    index?: number | undefined;
    transparent?: boolean | undefined;
    geometry?: import("three").BufferGeometry<import("three").NormalBufferAttributes> | undefined;
    radius?: number | undefined;
    centralAngle?: number | undefined;
}, "ref"> & React.RefAttributes<Object3D<import("three").Event>>, "ref">, "texture" | "updateTarget"> & {
    far?: number | undefined;
    near?: number | undefined;
    precision?: number | undefined;
} & React.RefAttributes<Object3D<import("three").Event>>>;
/**
 * expects the Koestlich container to be at 0,0,0 with anchor center
 */
export declare const KoestlichFullscreenCamera: React.ForwardRefExoticComponent<{
    near?: number | undefined;
    far?: number | undefined;
    zoom?: number | undefined;
    width: number;
    height: number;
} & React.RefAttributes<OrthographicCamera>>;
