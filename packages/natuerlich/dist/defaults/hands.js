import React from "react";
import { useInputSources } from "../react/listeners.js";
import { GrabHand, PointerHand, TeleportHand, TouchHand } from "./index.js";
import { getInputSourceId } from "../index.js";
/**
 * default hands of either type "pointer", "grab", "teleport", or "touch"
 */
export function Hands({ type = "pointer", ...props }) {
    const inputSources = useInputSources();
    const Hand = selectHand(type);
    return (React.createElement(React.Fragment, null, inputSources
        .filter((inputSource) => inputSource.hand != null)
        .map((inputSource) => (React.createElement(Hand, { hand: inputSource.hand, id: getInputSourceId(inputSource), inputSource: inputSource, key: getInputSourceId(inputSource), ...props })))));
}
function selectHand(type) {
    switch (type) {
        case "grab":
            return GrabHand;
        case "pointer":
            return PointerHand;
        case "teleport":
            return TeleportHand;
        case "touch":
            return TouchHand;
    }
}
