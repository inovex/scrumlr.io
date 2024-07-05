/* eslint-disable react/no-unknown-property */
import {useFrame} from "@react-three/fiber";
import {MutableRefObject, useRef} from "react";
import {Frustum, Group, Material, Matrix4, Mesh, Object3DEventMap, Vector3} from "three";

type XRContainerCueProps = {
  containerRef: MutableRefObject<Group<Object3DEventMap>>;
};

const vec3 = new Vector3();
const frustum = new Frustum();
const matrix = new Matrix4();
const opacityLerpSpeed = 0.1;

const XRContainerCue = ({containerRef}: XRContainerCueProps) => {
  const cueRef = useRef<Group>(null!);
  const opacity = useRef(0);

  const setOpacity = (value: number) => {
    opacity.current = value;
    cueRef.current.children.forEach((child) => {
      ((child as Mesh).material as Material).opacity = value;
    });
  };

  useFrame(({camera}) => {
    if (!containerRef.current) return;

    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(matrix);

    if (frustum.containsPoint(containerRef.current.position)) {
      if (opacity.current > 0) {
        setOpacity(opacity.current - opacityLerpSpeed);
      } else cueRef.current.visible = false;
      return;
    }

    const camDir = camera.getWorldDirection(vec3).normalize();
    const targetPosition = camera.position.clone().add(camDir);

    if (opacity.current <= 0) {
      cueRef.current.position.copy(targetPosition);
      cueRef.current.visible = true;
      setOpacity(opacity.current + opacityLerpSpeed / 2);
    } else {
      if (opacity.current < 1) setOpacity(opacity.current + opacityLerpSpeed);
      cueRef.current.position.lerp(targetPosition, 0.08);
    }

    cueRef.current.lookAt(containerRef.current.position);
    cueRef.current.rotateX(Math.PI / 2);
  });

  return (
    <group ref={cueRef} castShadow>
      <mesh>
        <cylinderGeometry args={[0, 0.02, 0.04]} />
        <meshStandardMaterial transparent color="white" roughness={0.5} />
      </mesh>
      <mesh position={new Vector3(0, -0.05, 0)}>
        <cylinderGeometry args={[0.01, 0.01, 0.06]} />
        <meshStandardMaterial transparent color="white" roughness={0.5} />
      </mesh>
    </group>
  );
};

export default XRContainerCue;
