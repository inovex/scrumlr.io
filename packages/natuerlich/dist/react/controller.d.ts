/// <reference types="webxr" resolution-mode="require"/>
import React from "react";
import { Group } from "three";
import { XRInputSourceData } from "../motion-controller.js";
import { ControllerProfile } from "../motion-controller.js";
/**
 * @returns the controller profile information based on the available input source profiles
 */
export declare function useInputSourceProfile(inputSourceProfiles: ReadonlyArray<string>, basePath?: string, defaultProfileId?: string): ControllerProfile;
/**
 * render a the detected controller model and animates pressed buttons and other input elements
 */
export declare const DynamicControllerModel: React.ForwardRefExoticComponent<{
    inputSource: XRInputSource;
    basePath?: string | undefined;
    defaultProfileId?: string | undefined;
} & React.RefAttributes<Group>>;
/**
 * render a the detected controller model
 */
export declare const StaticControllerModel: React.ForwardRefExoticComponent<{
    inputSource: XRInputSourceData;
    basePath?: string | undefined;
    defaultProfileId?: string | undefined;
} & React.RefAttributes<Group>>;
