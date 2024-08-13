import { useXR } from "../index.js";
import React from "react";
export function useIsInSessionMode(allow, deny) {
    const mode = useXR((state) => state.mode);
    if (deny != null) {
        return Array.isArray(deny) ? !deny.includes(mode) : deny != mode;
    }
    if (allow != null) {
        return Array.isArray(allow) ? allow.includes(mode) : allow === mode;
    }
    return true;
}
/**
 * guard that only makes its content visible based on denied or allowed session modes
 */
export function VisibilitySessionModeGuard({ children, allow, deny, }) {
    const visible = useIsInSessionMode(allow, deny);
    return React.createElement("group", { visible: visible }, children);
}
/**
 * guard that only includes content based on denied or allowed session modes
 */
export function SessionModeGuard({ children, allow, deny, }) {
    const visible = useIsInSessionMode(allow, deny);
    return visible ? React.createElement(React.Fragment, null, children) : null;
}
