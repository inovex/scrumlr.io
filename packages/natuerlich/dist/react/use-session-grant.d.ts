/// <reference types="webxr" resolution-mode="require"/>
/**
 * enters the described webxr session
 * @param options required and optional webxr features and trackedImages
 */
export declare function useSessionGrant(options?: (XRSessionInit & {
    trackedImages?: Array<{
        image: ImageBitmap;
        widthInMeters: number;
    }>;
}) | undefined): void;
