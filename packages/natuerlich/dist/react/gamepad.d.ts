/// <reference types="webxr" resolution-mode="require"/>
import { RootState } from "@react-three/fiber";
import { Vector2 } from "three";
export declare enum ButtonState {
    DEFAULT = "default",
    TOUCHED = "touched",
    PRESSED = "pressed"
}
export declare const useXRGamepadReader: (inputSource: XRInputSource, basePath?: string, defaultProfileId?: string) => {
    readButtonValue: (id: string) => number;
    readButton: (id: string) => GamepadButton | undefined;
    readButtonState: (id: string) => ButtonState;
    readAxes: (id: string, target: Vector2) => boolean;
};
export declare const useXRGamepadButton: (inputSource: XRInputSource, componentId: string, pressCallback?: ((state: RootState, frame: XRFrame | undefined) => void) | undefined, releaseCallback?: ((state: RootState, frame: XRFrame | undefined) => void) | undefined) => void;
