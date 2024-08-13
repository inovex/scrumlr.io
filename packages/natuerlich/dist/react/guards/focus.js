import React from "react";
import { useFocusState } from "../index.js";
/**
 * guard that only makes its content visible when the session is not blurred or when not in a session
 */
export function VisibilityFocusStateGuard({ children }) {
    const focusState = useFocusState();
    return React.createElement("group", { visible: focusState == null || focusState === "visible" }, children);
}
/**
 * guard that only includes content when the session is not blurred or when not in a session
 */
export function FocusStateGuard({ children }) {
    const focusState = useFocusState();
    if (focusState != "visible" && focusState != null) {
        return null;
    }
    return React.createElement(React.Fragment, null, children);
}
