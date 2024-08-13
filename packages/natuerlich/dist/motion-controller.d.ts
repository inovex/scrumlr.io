import type { MotionController } from "@webxr-input-profiles/motion-controllers";
import { Object3D } from "three";
export type XRInputSourceData = Readonly<{
    /**
     * array of profile ids from XRInputSource.profiles
     */
    profiles: ReadonlyArray<string>;
    /**
     * handedness of the input source
     * can be "left", "right", "any", or any additional by the profile supported handedness
     */
    handedness: string;
}>;
export type ControllerComponent = {
    type: "trigger" | "squeeze" | "touchpad" | "thumbstick" | "button" | string;
    gamepadIndices: {
        [Key in string | "button" | "xAxis" | "yAxis"]?: number;
    };
    rootNodeName: string;
    visualResponses: any;
};
export type ControllerLayout = {
    selectComponentId: string;
    components: {
        [Key in string]: ControllerComponent;
    };
    gamepadMapping: string;
    rootNodeName: string;
    assetPath: string;
};
export type ControllerProfile = {
    profileId: string;
    fallbackProfileIds: Array<string>;
    deprecatedProfileIds?: Array<string>;
    profilePath: string;
    layouts: {
        [Key in "left" | "right" | "none" | "left-right" | "left-right-none" | string]?: ControllerLayout;
    };
};
export declare function fetchControllerProfile(inputSourceProfiles: ReadonlyArray<string>, basePath?: string, defaultProfileId?: string): Promise<ControllerProfile>;
export declare function getAssetPath(profile: ControllerProfile, handedness: string): string;
export declare function bindMotionControllerToObject(motionController: MotionController, controller: Object3D): void;
export declare function updateMotionController(motionController: MotionController): void;
