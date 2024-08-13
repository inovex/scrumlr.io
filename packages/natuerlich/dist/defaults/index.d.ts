/// <reference types="webxr" resolution-mode="require"/>
import { XIntersection } from "@coconut-xr/xinteraction";
import { MutableRefObject, RefObject } from "react";
import { Color, ColorRepresentation, MeshBasicMaterial, Object3D, PositionalAudio as PositionalAudioImpl } from "three";
import React from "react";
export declare const CursorBasicMaterial: (new (...args: any[]) => {
    onBeforeCompile(shader: import("three").Shader, renderer: import("three").WebGLRenderer): void;
    alphaTest: number;
    alphaToCoverage: boolean;
    blendDst: import("three").BlendingDstFactor;
    blendDstAlpha: number | null;
    blendEquation: import("three").BlendingEquation;
    blendEquationAlpha: number | null;
    blending: import("three").Blending;
    blendSrc: 210 | import("three").BlendingDstFactor;
    blendSrcAlpha: number | null;
    clipIntersection: boolean;
    clippingPlanes: any;
    clipShadows: boolean;
    colorWrite: boolean;
    defines: {
        [key: string]: any;
    } | undefined;
    depthFunc: import("three").DepthModes;
    depthTest: boolean;
    depthWrite: boolean;
    id: number;
    stencilWrite: boolean;
    stencilFunc: import("three").StencilFunc;
    stencilRef: number;
    stencilWriteMask: number;
    stencilFuncMask: number;
    stencilFail: import("three").StencilOp;
    stencilZFail: import("three").StencilOp;
    stencilZPass: import("three").StencilOp;
    readonly isMaterial: true;
    name: string;
    needsUpdate: boolean;
    opacity: number;
    polygonOffset: boolean;
    polygonOffsetFactor: number;
    polygonOffsetUnits: number;
    precision: "highp" | "mediump" | "lowp" | null;
    premultipliedAlpha: boolean;
    dithering: boolean;
    side: import("three").Side;
    shadowSide: import("three").Side | null;
    toneMapped: boolean;
    transparent: boolean;
    type: string;
    uuid: string;
    vertexColors: boolean;
    visible: boolean;
    userData: any;
    version: number;
    clone(): any;
    copy(material: import("three").Material): any;
    dispose(): void;
    customProgramCacheKey(): string;
    setValues(values: import("three").MaterialParameters): void;
    toJSON(meta?: any): any;
    addEventListener<T_1 extends string>(type: T_1, listener: import("three").EventListener<import("three").Event, T_1, any>): void;
    hasEventListener<T_2 extends string>(type: T_2, listener: import("three").EventListener<import("three").Event, T_2, any>): boolean;
    removeEventListener<T_3 extends string>(type: T_3, listener: import("three").EventListener<import("three").Event, T_3, any>): void;
    dispatchEvent(event: import("three").Event): void;
}) & typeof MeshBasicMaterial;
export declare const RayBasicMaterial: (new (...args: any[]) => {
    onBeforeCompile(shader: import("three").Shader, renderer: import("three").WebGLRenderer): void;
    alphaTest: number;
    alphaToCoverage: boolean;
    blendDst: import("three").BlendingDstFactor;
    blendDstAlpha: number | null;
    blendEquation: import("three").BlendingEquation;
    blendEquationAlpha: number | null;
    blending: import("three").Blending;
    blendSrc: 210 | import("three").BlendingDstFactor;
    blendSrcAlpha: number | null;
    clipIntersection: boolean;
    clippingPlanes: any;
    clipShadows: boolean;
    colorWrite: boolean;
    defines: {
        [key: string]: any;
    } | undefined;
    depthFunc: import("three").DepthModes;
    depthTest: boolean;
    depthWrite: boolean;
    id: number;
    stencilWrite: boolean;
    stencilFunc: import("three").StencilFunc;
    stencilRef: number;
    stencilWriteMask: number;
    stencilFuncMask: number;
    stencilFail: import("three").StencilOp;
    stencilZFail: import("three").StencilOp;
    stencilZPass: import("three").StencilOp;
    readonly isMaterial: true;
    name: string;
    needsUpdate: boolean;
    opacity: number;
    polygonOffset: boolean;
    polygonOffsetFactor: number;
    polygonOffsetUnits: number;
    precision: "highp" | "mediump" | "lowp" | null;
    premultipliedAlpha: boolean;
    dithering: boolean;
    side: import("three").Side;
    shadowSide: import("three").Side | null;
    toneMapped: boolean;
    transparent: boolean;
    type: string;
    uuid: string;
    vertexColors: boolean;
    visible: boolean;
    userData: any;
    version: number;
    clone(): any;
    copy(material: import("three").Material): any;
    dispose(): void;
    customProgramCacheKey(): string;
    setValues(values: import("three").MaterialParameters): void;
    toJSON(meta?: any): any;
    addEventListener<T_1 extends string>(type: T_1, listener: import("three").EventListener<import("three").Event, T_1, any>): void;
    hasEventListener<T_2 extends string>(type: T_2, listener: import("three").EventListener<import("three").Event, T_2, any>): boolean;
    removeEventListener<T_3 extends string>(type: T_3, listener: import("three").EventListener<import("three").Event, T_3, any>): void;
    dispatchEvent(event: import("three").Event): void;
}) & typeof MeshBasicMaterial;
export declare function isTouchscreen(inputSource: XRInputSource): boolean;
export declare function updateCursorTransformation(inputSource: XRInputSource, intersections: ReadonlyArray<XIntersection>, cursorRef: RefObject<Object3D>, cursorOffset: number): void;
export declare function updateRayTransformation(intersections: ReadonlyArray<XIntersection>, maxLength: number, rayRef: RefObject<Object3D>): void;
export declare function triggerVibration(intersections: ReadonlyArray<XIntersection>, inputSource: XRInputSource, refPrevIntersected: MutableRefObject<boolean>): void;
export declare function updateColor(pressed: boolean, material: {
    color: Color;
}, normalColor: ColorRepresentation, pressColor: ColorRepresentation): void;
export declare function updateCursorDistanceOpacity(material: {
    opacity: number;
}, distance: number, smallestDistance: number, highestDistance: number, cursorOpacity: number): void;
export declare const PositionalAudio: React.ForwardRefExoticComponent<{
    volume: number;
    url: string;
} & React.RefAttributes<PositionalAudioImpl>>;
export * from "./canvas.js";
export * from "./grab-controller.js";
export * from "./grab-hand.js";
export * from "./pointer-controller.js";
export * from "./pointer-hand.js";
export * from "./touch-hand.js";
export * from "./teleport.js";
export * from "./koestlich.js";
export * from "./grabbable.js";
export * from "./controllers.js";
export * from "./hands.js";