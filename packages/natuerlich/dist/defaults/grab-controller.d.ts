/// <reference types="webxr" resolution-mode="require"/>
import { XIntersection } from "@coconut-xr/xinteraction";
import React, { ReactNode } from "react";
import { ColorRepresentation, Event } from "three";
import { ThreeEvent } from "@react-three/fiber";
/**
 * controller for grabbing objects when the squeeze button is pressed
 * includes hover effects
 */
export declare function GrabController({ inputSource, children, filterIntersections, id, cursorColor, cursorOpacity, cursorPressColor, cursorSize, cursorVisible, radius, cursorOffset, pressSoundUrl, pressSoundVolume, ...rest }: {
    inputSource: XRInputSource;
    children?: ReactNode;
    id: number;
    filterIntersections?: (intersections: Array<XIntersection>) => Array<XIntersection>;
    cursorColor?: ColorRepresentation;
    cursorPressColor?: ColorRepresentation;
    cursorOpacity?: number;
    cursorSize?: number;
    cursorVisible?: boolean;
    radius?: number;
    cursorOffset?: number;
    onPointerDownMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    onPointerUpMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    onClickMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    pressSoundUrl?: string;
    pressSoundVolume?: number;
}): React.JSX.Element | null;
