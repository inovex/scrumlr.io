/// <reference types="webxr" resolution-mode="require"/>
/**
 * @param onSessionChange callback executed when the session changes containing the current and old webxr session
 * @param deps the dependencies that make the onSessionChange change
 */
export declare function useSessionChange(onSessionChange: (session: XRSession | undefined, prevSession: XRSession | undefined) => void, deps: ReadonlyArray<any>): void;
/**
 *
 * @param onXRInputSourcesChange callback executed when the input sources change
 * @param deps the dependencies that make the onXRInputSourcesChange change
 */
export declare function useInputSourceChange(onXRInputSourcesChange: (e: XRInputSourceChangeEvent) => void, deps: ReadonlyArray<any>): void;
/**
 * @param callback function that gets called when the specified event happens
 * @param deps the dependencies that make the callback change
 */
export declare function useInputSourceEvent(name: "select" | "selectstart" | "selectend" | "squeeze" | "squeezestart" | "squeezeend", inputSource: XRInputSource, callback: (e: XRInputSourceEvent) => void, deps: ReadonlyArray<any>): void;
/**
 * @returns the currently active input sources
 */
export declare function useInputSources(): Array<XRInputSource>;
