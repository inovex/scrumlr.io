import {useTrackedPlanes} from "@coconut-xr/natuerlich/react";
import {Plane} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useRef} from "react";
import {DirectionalLight, Euler, Mesh, Vector3} from "three";

const lightPosition = new Vector3(0, 20, 0);
const initialPlanePosition = new Vector3(0, -1.5, 0);
const planeRotation = new Euler(-Math.PI / 2, 0, 0);

/* eslint-disable react/no-unknown-property */
const XRLight = () => {
  const dirLight = useRef<DirectionalLight>(null!);
  const floorPlaneRef = useRef<Mesh>(null!);

  const floor = useTrackedPlanes()?.find((plane) => plane.semanticLabel === "floor");

  useFrame(() => {
    if (!floor?.initialPose) return;

    floorPlaneRef.current.position.copy(floor.initialPose.transform.position);
  });

  return (
    <>
      <ambientLight />
      <directionalLight
        intensity={3}
        castShadow
        ref={dirLight}
        position={lightPosition}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <Plane ref={floorPlaneRef} position={initialPlanePosition} rotation={planeRotation} args={[40, 40]} receiveShadow>
        <shadowMaterial opacity={0.25} />
      </Plane>
    </>
  );
};

export default XRLight;
