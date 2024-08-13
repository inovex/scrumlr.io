/// <reference types="webxr" resolution-mode="require"/>
import React, { ReactNode } from "react";
/**
 * guard that only makes its content visible when the session mode is supported
 */
export declare function VisibilitySessionSupportedGuard({ children, mode, }: {
    children?: ReactNode;
    mode: XRSessionMode;
}): React.JSX.Element;
/**
 * guard that only includes content when the session mode is supported
 */
export declare function SessionSupportedGuard({ children, mode, }: {
    children?: ReactNode;
    mode: XRSessionMode;
}): React.JSX.Element | null;
