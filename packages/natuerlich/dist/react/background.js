import { createPortal, useThree } from "@react-three/fiber";
import React from "react";
import { BufferAttribute, BufferGeometry, FrontSide } from "three";
//TODO: map
const screenQuadGeometry = new BufferGeometry();
const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
screenQuadGeometry.setAttribute("position", new BufferAttribute(vertices, 2));
/**
 * component to set a background color in a scene
 */
export function Background({ color }) {
    const camera = useThree(({ camera }) => camera);
    return createPortal(React.createElement("mesh", { position: [0, 0, camera.far * -0.99], scale: 100000, renderOrder: -100, geometry: screenQuadGeometry },
        React.createElement("meshBasicMaterial", { toneMapped: false, depthWrite: false, depthTest: true, side: FrontSide, color: color })), camera);
}
