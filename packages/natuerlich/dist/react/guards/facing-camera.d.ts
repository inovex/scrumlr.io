import { ReactNode, RefObject } from "react";
import { Group, Vector3 } from "three";
import React from "react";
export declare function useIsFacingCamera(ref: RefObject<Group>, set: (show: boolean) => void, direction: Vector3, angle: number): void;
/**
 * guard that detects if the camera is faced and makes content visible based on the provided angle
 */
export declare function VisibilityFacingCameraGuard({ children, direction, angle, }: {
    children?: ReactNode;
    direction: Vector3;
    angle?: number;
}): React.JSX.Element;
/**
 * guard that detects if the camera is faced and includes content based on the provided angle
 */
export declare function FacingCameraGuard({ children, direction, angle, }: {
    children?: ReactNode;
    direction: Vector3;
    angle?: number;
}): React.JSX.Element | null;
