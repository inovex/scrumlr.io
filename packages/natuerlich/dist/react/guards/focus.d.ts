import React, { ReactNode } from "react";
/**
 * guard that only makes its content visible when the session is not blurred or when not in a session
 */
export declare function VisibilityFocusStateGuard({ children }: {
    children?: ReactNode;
}): React.JSX.Element;
/**
 * guard that only includes content when the session is not blurred or when not in a session
 */
export declare function FocusStateGuard({ children }: {
    children?: ReactNode;
}): React.JSX.Element | null;
