/// <reference types="webxr" resolution-mode="require"/>
import { ReactNode } from "react";
import { XIntersection } from "@coconut-xr/xinteraction";
import React from "react";
import { ColorRepresentation, Event } from "three";
import { ThreeEvent } from "@react-three/fiber";
/**
 * controller for pointing objects when the select button is pressed
 * includes a cursor and ray visualization
 */
export declare function PointerController({ inputSource, children, filterIntersections, id, cursorColor, cursorPressColor, cursorOpacity, cursorSize, cursorVisible, rayColor, rayPressColor, rayMaxLength, rayVisibile, raySize, cursorOffset, pressSoundUrl, pressSoundVolume, scrollSpeed, ...rest }: {
    inputSource: XRInputSource;
    children?: ReactNode;
    id: number;
    filterIntersections?: (intersections: XIntersection[]) => XIntersection[];
    cursorColor?: ColorRepresentation;
    cursorPressColor?: ColorRepresentation;
    cursorOpacity?: number;
    cursorSize?: number;
    cursorVisible?: boolean;
    rayColor?: ColorRepresentation;
    rayPressColor?: ColorRepresentation;
    rayMaxLength?: number;
    rayVisibile?: boolean;
    raySize?: number;
    cursorOffset?: number;
    onPointerDownMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    onPointerUpMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    onClickMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    pressSoundUrl?: string;
    pressSoundVolume?: number;
    scrollSpeed?: number | null;
}): React.JSX.Element;
