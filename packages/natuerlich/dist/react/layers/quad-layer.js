/* eslint-disable react/display-name */
import { context, reconciler, useStore } from "@react-three/fiber";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, } from "react";
import React from "react";
import { PerspectiveCamera, PlaneGeometry, Scene, } from "three";
import { useLayer, useLayerUpdate } from "./index.js";
import { create } from "zustand";
import { useMeshForwardEventsFromStore } from "@coconut-xr/xinteraction/react";
const planeGeometry = new PlaneGeometry();
/**
 * 1x1 plane containing the content in the best possible resolution
 * Content size required at init. Either specify a "content" or a "contentWidth" and "contentHeight".
 * Don't change the content size often due to performance reasons.
 */
export const QuadLayer = forwardRef(({ colorFormat, depthFormat, texture: customTexture, index = -1, pixelHeight, pixelWidth, updateTarget, geometry = planeGeometry, transparent = false, ...props }, ref) => {
    const internalRef = useRef(null);
    const isStatic = updateTarget == null;
    const layer = useLayer(useCallback((binding, space) => binding.createQuadLayer({
        space,
        viewPixelHeight: pixelHeight,
        viewPixelWidth: pixelWidth,
        width: 0,
        height: 0,
        isStatic,
        colorFormat,
        depthFormat,
        transform: new XRRigidTransform(),
    }), [colorFormat, depthFormat, isStatic, pixelHeight, pixelWidth]), transparent, index);
    const texture = useLayerUpdate(internalRef, layer, customTexture, transparent, pixelWidth, pixelHeight, updateLayerScale, updateTarget);
    useImperativeHandle(ref, () => internalRef.current, []);
    return (React.createElement("mesh", { renderOrder: layer != null ? -1000 : undefined, ref: internalRef, visible: layer == null || !transparent, geometry: geometry, ...props },
        React.createElement("meshBasicMaterial", { transparent: transparent, map: texture, depthWrite: true, colorWrite: layer == null, toneMapped: false })));
});
function updateLayerScale(layer, scale) {
    layer.width = scale.x / 2;
    layer.height = scale.y / 2;
}
/**
 * quad layer that renders its content in the best possible resolution
 * requires "anchor" feature flag
 */
export const QuadLayerPortal = forwardRef(({ children, dragDistance, ...props }, ref) => {
    const rootStore = useStore();
    const store = useMemo(() => {
        const scene = new Scene();
        const camera = new PerspectiveCamera(undefined, props.pixelWidth / props.pixelHeight);
        camera.userData.helloWorld = true;
        scene.add(camera);
        return create((set, get) => ({
            ...rootStore.getState(),
            set,
            get,
            scene,
            camera,
            size: { left: 0, top: 0, width: props.pixelWidth, height: props.pixelHeight },
        }));
    }, [rootStore, props.pixelHeight, props.pixelWidth]);
    const updateTarget = useCallback((renderer, target) => {
        const { camera, scene } = store.getState();
        const prevTarget = renderer.getRenderTarget();
        const xrEnabled = renderer.xr.enabled;
        renderer.xr.enabled = false;
        renderer.setRenderTarget(target);
        renderer.render(scene, camera);
        renderer.xr.enabled = xrEnabled;
        renderer.setRenderTarget(prevTarget);
    }, []);
    const eventProps = useMeshForwardEventsFromStore(store.getState, dragDistance);
    useImperativeHandle(ref, () => eventProps.ref.current, []);
    return (React.createElement(React.Fragment, null,
        reconciler.createPortal(React.createElement(context.Provider, { value: store }, children), store, null),
        React.createElement(QuadLayer, { ...props, updateTarget: updateTarget, ...eventProps })));
});
