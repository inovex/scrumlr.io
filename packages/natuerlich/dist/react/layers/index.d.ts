/// <reference types="webxr" resolution-mode="require"/>
import { RefObject } from "react";
import { Mesh, Texture, Vector3, WebGLRenderTarget, WebGLRenderer } from "three";
export declare function writeContentToLayer(renderer: WebGLRenderer, layer: XRCompositionLayer, frame: XRFrame, content: TexImageSource): void;
/**
 * hook to create and manage layers
 * @param createLayer the function to create the layer via WebXR
 * @param transparent wether the layer should be transparent
 * @param index the order of the layer in regards to all other layers
 * @returns the created layer
 */
export declare function useLayer<T extends XRQuadLayer | XRCylinderLayer>(createLayer: (binding: XRWebGLBinding, space: XRSpace) => T, transparent: boolean, index: number): T | undefined;
/**
 * function to update the contents and transformation of a layer
 * @param ref the object that is bound to the layer
 * @param layer the layer to update
 * @param texture the texture to update the layer with (optional)
 * @param transparent
 * @param width
 * @param height
 * @param updateLayerSize function to update the webxr layer based on a scale
 * @param updateTarget function to update the layer content for dynamic content (optional)
 * @returns either the passed texture or a texture form the render target for dynamic content
 */
export declare function useLayerUpdate<T extends XRQuadLayer | XRCylinderLayer>(ref: RefObject<Mesh>, layer: T | undefined, texture: Texture | undefined, transparent: boolean, width: number, height: number, updateLayerSize: (layer: T, scale: Vector3) => void, updateTarget?: (renderer: WebGLRenderer, target: WebGLRenderTarget) => void): Texture | undefined;
export * from "./quad-layer.js";
export * from "./cylinder-layer.js";
