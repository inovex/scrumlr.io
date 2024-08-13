import React from "react";
import { useInputSources } from "../react/listeners.js";
import { GrabController, PointerController, TeleportController } from "./index.js";
import { getInputSourceId } from "../index.js";
/**
 * default controllers of either type "pointer", "grab", or "teleport"
 */
export function Controllers({ type = "pointer", ...props }) {
    const inputSources = useInputSources();
    const Controller = selectController(type);
    return (React.createElement(React.Fragment, null, inputSources
        .filter((inputSource) => inputSource.hand == null)
        .map((inputSource) => (React.createElement(Controller, { id: getInputSourceId(inputSource), inputSource: inputSource, key: getInputSourceId(inputSource), ...props })))));
}
function selectController(type) {
    switch (type) {
        case "grab":
            return GrabController;
        case "pointer":
            return PointerController;
        case "teleport":
            return TeleportController;
    }
}
