import { PerspectiveCameraProps } from "@react-three/fiber";
import React from "react";
import { PerspectiveCamera } from "three";
/**
 * component to position and rotate the camera when not in immersive mode
 */
export declare const NonImmersiveCamera: React.ForwardRefExoticComponent<Omit<PerspectiveCameraProps, "ref"> & React.RefAttributes<PerspectiveCamera>>;
