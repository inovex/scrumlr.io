import { useFrame, useStore } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { DepthFormat, DepthStencilFormat, DepthTexture, Matrix4, Quaternion, RGBAFormat, UnsignedByteType, UnsignedInt248Type, UnsignedIntType, Vector3, WebGLRenderTarget, } from "three";
import { useXR } from "../state.js";
export function writeContentToLayer(renderer, layer, frame, content) {
    const context = renderer.getContext();
    const subImage = renderer.xr.getBinding().getSubImage(layer, frame);
    renderer.state.bindTexture(context.TEXTURE_2D, subImage.colorTexture);
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
    context.texSubImage2D(context.TEXTURE_2D, 0, 0, 0, content.width, content.height, context.RGBA, context.UNSIGNED_BYTE, content);
}
/**
 * hook to create and manage layers
 * @param createLayer the function to create the layer via WebXR
 * @param transparent wether the layer should be transparent
 * @param index the order of the layer in regards to all other layers
 * @returns the created layer
 */
export function useLayer(createLayer, transparent, index) {
    const store = useStore();
    const supportsLayers = useXR(({ session }) => session?.enabledFeatures?.includes("layers") ?? false);
    const supportsDepthSorting = useXR(({ session }) => session?.enabledFeatures?.includes("depth-sorted-layers") ?? false);
    const layersEnabled = supportsLayers && (!transparent || supportsDepthSorting);
    const layer = useMemo(() => {
        if (!layersEnabled) {
            return undefined;
        }
        const xrManager = store.getState().gl.xr;
        const binding = xrManager.getBinding();
        const space = xrManager.getReferenceSpace();
        if (space == null) {
            return undefined;
        }
        return createLayer(binding, space);
    }, [layersEnabled, store, createLayer]);
    useEffect(() => {
        if (layer == null) {
            return;
        }
        useXR.getState().addLayer(index, layer);
        return () => {
            layer.destroy();
            useXR.getState().removeLayer(layer);
        };
    }, [layer, index]);
    return layer;
}
const positionHelper = new Vector3();
const quaternionHelper = new Quaternion();
const scaleHelper = new Vector3();
const matrixHelper = new Matrix4();
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
export function useLayerUpdate(ref, layer, texture, transparent, width, height, updateLayerSize, updateTarget) {
    const store = useStore();
    const nonLayerRenderTarget = useMemo(() => {
        if (layer != null || texture != null) {
            return undefined;
        }
        const renderer = store.getState().gl;
        const attributes = renderer.getContext().getContextAttributes();
        return new WebGLRenderTarget(width, height, {
            type: UnsignedByteType,
            format: RGBAFormat,
            stencilBuffer: attributes?.stencil,
            colorSpace: renderer.outputColorSpace,
            samples: attributes?.antialias ? 4 : 1,
        });
    }, [layer, texture, width, height, store]);
    //cleanup nonLayerRenderTarget
    useEffect(() => () => nonLayerRenderTarget?.dispose(), [nonLayerRenderTarget]);
    useFrame((state, _delta, frame) => {
        //update layer position
        if (layer != null && ref.current != null) {
            matrixHelper
                .multiplyMatrices(state.camera.matrix, state.camera.matrixWorldInverse)
                .multiply(ref.current.matrixWorld)
                .decompose(positionHelper, quaternionHelper, scaleHelper);
            layer.transform = new XRRigidTransform(positionHelper, quaternionHelper);
            updateLayerSize(layer, scaleHelper);
        }
        //update non-layer target
        if (nonLayerRenderTarget != null && updateTarget != null) {
            updateTarget(state.gl, nonLayerRenderTarget);
            return;
        }
        if (frame == null || layer == null) {
            return;
        }
        //re-write texture if necassary
        if (texture != null && layer.needsRedraw) {
            writeContentToLayer(state.gl, layer, frame, texture.image);
            return;
        }
        //re-render target for layer
        //workarround
        if (updateTarget == null) {
            return;
        }
        const renderer = state.gl;
        //we need to recreate the render target so that the color buffer is bound to the colorTexture of the layer
        //the following is very bad
        const attributes = renderer.getContext().getContextAttributes();
        const target = new WebGLRenderTarget(width, height, {
            type: UnsignedByteType,
            format: RGBAFormat,
            depthTexture: transparent
                ? new DepthTexture(width, height, attributes?.stencil ? UnsignedInt248Type : UnsignedIntType, undefined, undefined, undefined, undefined, undefined, undefined, attributes?.stencil ? DepthStencilFormat : DepthFormat)
                : undefined,
            stencilBuffer: attributes?.stencil,
            colorSpace: renderer.outputColorSpace,
            samples: attributes?.antialias ? 4 : 1,
        });
        renderer.initTexture(target.texture);
        if (target.depthTexture != null) {
            renderer.initTexture(target.depthTexture);
        }
        const subImage = renderer.xr.getBinding().getSubImage(layer, frame);
        renderer.properties.get(target.texture).__webglTexture = subImage.colorTexture;
        if (target.depthTexture != null) {
            renderer.properties.get(target.depthTexture).__webglTexture = subImage.depthStencilTexture;
        }
        updateTarget(renderer, target);
    });
    return texture ?? nonLayerRenderTarget?.texture;
}
export * from "./quad-layer.js";
export * from "./cylinder-layer.js";
