import { ReactNode } from "react";
import { ExtendedXRSessionMode } from "../state.js";
import React from "react";
export declare function useIsInSessionMode(allow?: ExtendedXRSessionMode | ReadonlyArray<ExtendedXRSessionMode>, deny?: ExtendedXRSessionMode | ReadonlyArray<ExtendedXRSessionMode>): boolean;
/**
 * guard that only makes its content visible based on denied or allowed session modes
 */
export declare function VisibilitySessionModeGuard({ children, allow, deny, }: {
    children?: ReactNode;
    allow?: ExtendedXRSessionMode | ReadonlyArray<ExtendedXRSessionMode>;
    deny?: ExtendedXRSessionMode | ReadonlyArray<ExtendedXRSessionMode>;
}): React.JSX.Element;
/**
 * guard that only includes content based on denied or allowed session modes
 */
export declare function SessionModeGuard({ children, allow, deny, }: {
    children?: ReactNode;
    allow?: ExtendedXRSessionMode | ReadonlyArray<ExtendedXRSessionMode>;
    deny?: ExtendedXRSessionMode | ReadonlyArray<ExtendedXRSessionMode>;
}): React.JSX.Element | null;
