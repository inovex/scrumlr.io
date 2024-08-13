/* eslint-disable react/display-name */
import { useThree } from "@react-three/fiber";
import React from "react";
import { forwardRef } from "react";
import { useXR } from "./state.js";
/**
 * component to position and rotate the session origin (the spawn point of for the xr session)
 */
export const ImmersiveSessionOrigin = forwardRef(({ cameraContent, children, ...props }, ref) => {
    const enabled = useXR(({ session }) => session != null);
    const camera = useThree((state) => state.camera);
    if (camera == null || !enabled) {
        return null;
    }
    return (React.createElement("group", { ref: ref, ...props },
        React.createElement("primitive", { object: camera }, cameraContent),
        children));
});
