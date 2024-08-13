/// <reference types="webxr" resolution-mode="require"/>
import { XIntersection } from "@coconut-xr/xinteraction";
import { GroupProps } from "@react-three/fiber";
import React, { MutableRefObject } from "react";
import { ReactNode } from "react";
import { ColorRepresentation, Vector3 } from "three";
/**
 * marks its children as teleportable
 */
export declare function TeleportTarget({ children, ...props }: {
    children?: ReactNode;
} & GroupProps): React.JSX.Element;
export declare function isTeleportTarget(intersection: XIntersection): boolean;
/**
 * hand for pointing to teleportable objects
 * is activated when the pinch gesture is detected
 * includes a cursor and a downward bend ray visualization
 */
export declare function TeleportHand({ hand, inputSource, children, onTeleport, teleportSoundUrl, teleportSoundVolume, childrenAtJoint, ...pointerProps }: {
    hand: XRHand;
    inputSource: XRInputSource;
    children?: ReactNode;
    id: number;
    rayColor?: ColorRepresentation;
    rayOpacity?: number;
    raySize?: number;
    cursorColor?: ColorRepresentation;
    cursorSize?: number;
    cursorOpacity?: number;
    childrenAtJoint?: XRHandJoint;
    onTeleport?: (point: Vector3) => void;
    filterIntersections?: (intersections: any[]) => any[];
    teleportSoundUrl?: string;
    teleportSoundVolume?: number;
}): React.JSX.Element;
/**
 * controller for pointing to teleportable objects
 * is activated when the pinch gesture is detected
 * includes a cursor and a downward bend ray visualization
 */
export declare function TeleportController({ inputSource, children, onTeleport, teleportSoundUrl, teleportSoundVolume, ...pointerProps }: {
    inputSource: XRInputSource;
    children?: ReactNode;
    id: number;
    rayColor?: ColorRepresentation;
    raySize?: number;
    rayOpacity?: number;
    cursorColor?: ColorRepresentation;
    cursorSize?: number;
    cursorOpacity?: number;
    onTeleport?: (point: Vector3) => void;
    filterIntersections?: (intersections: any[]) => any[];
    teleportSoundUrl?: string;
    teleportSoundVolume?: number;
}): React.JSX.Element;
export declare function TeleportPointer({ rayColor, raySize, filterIntersections: customFilterIntersections, id, currentIntersectionRef, cursorColor, cursorSize, cursorOpacity, inputSource, }: {
    inputSource: XRInputSource;
    rayColor?: ColorRepresentation;
    rayOpacity?: number;
    raySize?: number;
    filterIntersections?: (intersections: any[]) => any[];
    currentIntersectionRef: MutableRefObject<XIntersection | undefined>;
    cursorColor?: ColorRepresentation;
    cursorOpacity?: number;
    cursorSize?: number;
    id: number;
}): React.JSX.Element;
