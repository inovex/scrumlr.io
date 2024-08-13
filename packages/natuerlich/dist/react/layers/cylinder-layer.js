/* eslint-disable react/display-name */
import { context, reconciler, useStore } from "@react-three/fiber";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, } from "react";
import React from "react";
import { CylinderGeometry, PerspectiveCamera, Scene, } from "three";
import { useLayer, useLayerUpdate } from "./index.js";
import { useMeshForwardEventsFromStore } from "@coconut-xr/xinteraction/react";
import { create } from "zustand";
const deg60 = (60 * Math.PI) / 180;
/**
 * partial cylinder containing the content in the best possible resolution
 * Content size required at init. Either specify a "content" or a "contentWidth" and "contentHeight".
 * Don't change the content raidus, centralAngle, contentWidth, and contentHeight often due to performance reasons.
 */
export const CylinderLayer = forwardRef(({ colorFormat, depthFormat, radius = 2, centralAngle = deg60, texture: customTexture, index = -1, pixelHeight, pixelWidth, updateTarget, geometry: customGeometry, transparent = false, ...props }, ref) => {
    const internalRef = useRef(null);
    const isStatic = updateTarget == null;
    const layer = useLayer(useCallback((binding, space) => binding.createCylinderLayer({
        space,
        viewPixelWidth: pixelWidth,
        viewPixelHeight: pixelHeight,
        aspectRatio: pixelWidth / pixelHeight,
        centralAngle: centralAngle,
        radius: 0,
        colorFormat,
        depthFormat,
        transform: new XRRigidTransform(),
        isStatic,
    }), [centralAngle, colorFormat, depthFormat, pixelHeight, pixelWidth, isStatic]), transparent, index);
    const texture = useLayerUpdate(internalRef, layer, customTexture, transparent, pixelWidth, pixelHeight, updateLayerScale.bind(null, radius), updateTarget);
    useImperativeHandle(ref, () => internalRef.current, []);
    const hasCustomGeometry = customGeometry != null;
    const geometry = useMemo(() => {
        if (hasCustomGeometry) {
            return undefined;
        }
        const width = radius * centralAngle; //(2 * PI * radius = umfang) * angle / (2 * PI)
        const height = (width * pixelHeight) / pixelWidth;
        const geometry = new CylinderGeometry(radius, radius, height, 32, 1, true, 0, centralAngle).rotateY(Math.PI - centralAngle / 2);
        geometry.scale(-1, 1, 1);
        return geometry;
    }, [hasCustomGeometry, radius, centralAngle, pixelHeight, pixelWidth]) ?? customGeometry;
    return (React.createElement("mesh", { renderOrder: layer != null ? -1000 : undefined, visible: layer == null || !transparent, geometry: geometry, ref: internalRef, ...props },
        React.createElement("meshBasicMaterial", { map: texture, colorWrite: layer == null, transparent: transparent, toneMapped: false })));
});
function updateLayerScale(radius, layer, scale) {
    layer.radius = scale.x * radius;
}
/**
 * cylindric layer that renders its content in the best possible resolution
 * requires "anchor" feature flag
 */
export const CylinderLayerPortal = forwardRef(({ children, dragDistance, ...props }, ref) => {
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
        React.createElement(CylinderLayer, { ...props, updateTarget: updateTarget, ...eventProps })));
});
