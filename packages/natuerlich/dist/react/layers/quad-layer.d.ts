import React from "react";
import { BufferGeometry, Object3D, Texture, WebGLRenderTarget, WebGLRenderer } from "three";
/**
 * 1x1 plane containing the content in the best possible resolution
 * Content size required at init. Either specify a "content" or a "contentWidth" and "contentHeight".
 * Don't change the content size often due to performance reasons.
 */
export declare const QuadLayer: React.ForwardRefExoticComponent<Omit<Omit<import("@react-three/fiber").ExtendedColors<import("@react-three/fiber").Overwrite<Partial<import("three").Group>, import("@react-three/fiber").NodeProps<import("three").Group, typeof import("three").Group>>>, import("@react-three/fiber").NonFunctionKeys<{
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
    texture?: Texture | undefined;
    updateTarget?: ((renderer: WebGLRenderer, target: WebGLRenderTarget) => void) | undefined;
    pixelWidth: number;
    pixelHeight: number;
    colorFormat?: GLenum | undefined;
    depthFormat?: GLenum | undefined;
    index?: number | undefined;
    transparent?: boolean | undefined;
    geometry?: BufferGeometry<import("three").NormalBufferAttributes> | undefined;
}, "ref"> & React.RefAttributes<Object3D<import("three").Event>>>;
/**
 * quad layer that renders its content in the best possible resolution
 * requires "anchor" feature flag
 */
export declare const QuadLayerPortal: React.ForwardRefExoticComponent<Omit<Omit<Omit<Omit<import("@react-three/fiber").ExtendedColors<import("@react-three/fiber").Overwrite<Partial<import("three").Group>, import("@react-three/fiber").NodeProps<import("three").Group, typeof import("three").Group>>>, import("@react-three/fiber").NonFunctionKeys<{
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
    texture?: Texture | undefined;
    updateTarget?: ((renderer: WebGLRenderer, target: WebGLRenderTarget) => void) | undefined;
    pixelWidth: number;
    pixelHeight: number;
    colorFormat?: GLenum | undefined;
    depthFormat?: GLenum | undefined;
    index?: number | undefined;
    transparent?: boolean | undefined;
    geometry?: BufferGeometry<import("three").NormalBufferAttributes> | undefined;
}, "ref"> & React.RefAttributes<Object3D<import("three").Event>>, "ref">, "texture" | "updateTarget"> & {
    dragDistance?: number | undefined;
} & React.RefAttributes<Object3D<import("three").Event>>>;
