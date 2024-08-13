import React from "react";
import { useSessionSupported } from "../index.js";
/**
 * guard that only makes its content visible when the session mode is supported
 */
export function VisibilitySessionSupportedGuard({ children, mode, }) {
    const supported = useSessionSupported(mode);
    return React.createElement("group", { visible: supported }, children);
}
/**
 * guard that only includes content when the session mode is supported
 */
export function SessionSupportedGuard({ children, mode, }) {
    const supported = useSessionSupported(mode);
    if (!supported) {
        return null;
    }
    return React.createElement(React.Fragment, null, children);
}
