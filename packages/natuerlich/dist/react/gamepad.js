import { useInputSourceProfile } from "./controller.js";
import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
export var ButtonState;
(function (ButtonState) {
    ButtonState["DEFAULT"] = "default";
    ButtonState["TOUCHED"] = "touched";
    ButtonState["PRESSED"] = "pressed";
})(ButtonState || (ButtonState = {}));
const ButtonTouchThreshold = 0.05;
export const useXRGamepadReader = (inputSource, basePath, defaultProfileId) => {
    const profile = useInputSourceProfile(inputSource.profiles, basePath, defaultProfileId);
    const profileComponents = useMemo(() => profile?.layouts?.[inputSource.handedness]?.components, [inputSource.handedness, profile?.layouts]);
    const readButton = useCallback((id) => {
        const gamepad = inputSource.gamepad;
        if (!gamepad || !profileComponents) {
            return;
        }
        const gamepadIndices = profileComponents[id]?.gamepadIndices;
        if (gamepadIndices?.button === undefined) {
            return;
        }
        return gamepad.buttons[gamepadIndices.button];
    }, [inputSource.gamepad, profileComponents]);
    const readButtonValue = useCallback((id) => {
        const gamepadButton = readButton(id);
        return gamepadButton ? Math.min(1, Math.max(0, gamepadButton.value)) : 0;
    }, [readButton]);
    const readButtonState = useCallback((id) => {
        const gamepadButton = readButton(id);
        // Set the state based on the button
        return gamepadButton
            ? gamepadButton.pressed || gamepadButton.value === 1
                ? ButtonState.PRESSED
                : gamepadButton.touched || gamepadButton.value > ButtonTouchThreshold
                    ? ButtonState.TOUCHED
                    : ButtonState.DEFAULT
            : ButtonState.DEFAULT;
    }, [readButton]);
    const readAxes = useCallback((id, target) => {
        const gamepad = inputSource.gamepad;
        if (!gamepad || !profileComponents) {
            return false;
        }
        const gamepadIndices = profileComponents[id]?.gamepadIndices;
        const x = gamepadIndices?.xAxis !== undefined ? gamepad.axes[gamepadIndices.xAxis] : 0;
        const y = gamepadIndices?.yAxis !== undefined ? gamepad.axes[gamepadIndices.yAxis] : 0;
        target.set(x, y);
        return true;
    }, [inputSource.gamepad, profileComponents]);
    return useMemo(() => ({
        readButtonValue,
        readButton,
        readButtonState,
        readAxes,
    }), [readAxes, readButtonValue, readButtonState, readButton]);
};
export const useXRGamepadButton = (inputSource, componentId, pressCallback, releaseCallback) => {
    const prevState = useRef(ButtonState.DEFAULT);
    const reader = useXRGamepadReader(inputSource);
    useFrame((state, _delta, frame) => {
        const newState = reader.readButtonState(componentId);
        if (!newState) {
            return;
        }
        if (pressCallback != null &&
            prevState.current !== ButtonState.PRESSED &&
            newState === ButtonState.PRESSED) {
            pressCallback(state, frame);
        }
        if (releaseCallback != null &&
            prevState.current === ButtonState.PRESSED &&
            newState !== ButtonState.PRESSED) {
            releaseCallback(state, frame);
        }
        prevState.current = newState;
    });
};
