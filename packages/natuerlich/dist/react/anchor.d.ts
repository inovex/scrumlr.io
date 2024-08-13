/// <reference types="webxr" resolution-mode="require"/>
import { Quaternion, Vector3 } from "three";
/**
 * stores and creates a anchor similar to useState
 * @returns a tuple containing the anchor and a function to create a new anchor
 */
export declare function useAnchor(): [
    anchor: XRAnchor | undefined,
    createAnchor: (worldPosition: Vector3, worldRotation: Quaternion) => Promise<void>
];
/**
 * stores and creates an anchor that is persisted in the local storage
 * @param key the key that is used to store and load the anchor id
 * @returns a tuple containing the anchor and a function to create a new anchor
 */
export declare function usePersistedAnchor(key: string): [
    anchor: XRAnchor | undefined,
    createAnchor: (worldPosition: Vector3, worldRotation: Quaternion) => Promise<void>
];
