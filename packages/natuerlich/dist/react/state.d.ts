/// <reference types="webxr" resolution-mode="require"/>
import { Camera, RootState } from "@react-three/fiber";
import { Object3D } from "three";
import { StoreApi } from "zustand";
export type XRImageTrackingScore = "untrackable" | "trackable";
export type XRImageTrackingState = "tracked" | "emulated";
export type XRImageTrackingResult = {
    readonly imageSpace: XRSpace;
    initialPose?: XRPose;
    readonly index: number;
    readonly trackingState: XRImageTrackingState;
    readonly measuredWidthInMeters: number;
};
export type XRTrackedImageInit = {
    image: ImageBitmap;
    widthInMeters: number;
};
export type XRInputSourceMap = Map<number, XRInputSource>;
export type TrackedImagesMap = Map<number, XRImageTrackingResult>;
export type ExtendedXRSessionMode = XRState["mode"];
export type ExtendedXRPlane = XRPlane & {
    semanticLabel?: string;
    initialPose?: XRPose;
};
export type ExtendedXRMesh = XRMesh & {
    semanticLabel?: string;
    initialPose?: XRPose;
};
export type XRState = ({
    mode: XRSessionMode;
    session: XRSession;
    inputSources: XRInputSourceMap;
    initialCamera: Camera;
    layers: Array<{
        index: number;
        layer: XRLayer;
    }>;
    trackedImages: TrackedImagesMap;
    requestedTrackedImages?: ReadonlyArray<XRTrackedImageInit>;
    trackedPlanes: ReadonlyArray<ExtendedXRPlane>;
    trackedMeshes: ReadonlyArray<ExtendedXRMesh>;
    visibilityState: XRVisibilityState;
} | {
    mode: "none";
    session?: undefined;
    inputSources?: undefined;
    initialCamera?: undefined;
    layers?: undefined;
    trackedImages?: undefined;
    requestedTrackedImages?: undefined;
    trackedPlanes?: undefined;
    trackedMeshes?: undefined;
    visibilityState?: undefined;
}) & {
    store?: StoreApi<RootState>;
    onNextFrameCallbacks: Set<(state: RootState, delta: number, frame: XRFrame | undefined) => void>;
};
export type GrabbableEventListener = (inputSourceId: number, target: Object3D) => void;
/**
 * allow to subscribe to the current xr state
 * allows to retrieve the current state via useXR.getState()
 */
export declare const useXR: import("zustand").UseBoundStore<StoreApi<Omit<XRState, "onFrame" | "setStore" | "addLayer" | "removeLayer" | "onVisibilityStateChanged" | "onXRInputSourcesChanged" | "onXREnd" | "setSession"> & {
    onFrame: (state: RootState, delta: number, frame: XRFrame | undefined) => void;
    setStore(store: StoreApi<RootState>): void;
    addLayer(index: number, layer: XRLayer): void;
    removeLayer(layer: XRLayer): void;
    onVisibilityStateChanged(e: XRSessionEvent): void;
    onXRInputSourcesChanged(e: XRInputSourceChangeEvent): void;
    onXREnd(e: XRSessionEvent): void;
    setSession(session: XRSession, mode: XRSessionMode, requestedTrackedImages?: ReadonlyArray<XRTrackedImageInit>): Promise<void>;
}>>;
