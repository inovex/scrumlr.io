/* eslint-disable react/no-unknown-property */
import {isXIntersection} from "@coconut-xr/xinteraction";
import {MutableRefObject, useRef} from "react";
import {Vector3, Euler, Group, Object3DEventMap} from "three";

type XRHandleBarProps = {
  containerRef: MutableRefObject<Group<Object3DEventMap>>;
};

const XRHandleBar = ({containerRef}: XRHandleBarProps) => {
  const downState = useRef<{
    pointerId: number;
    pointToObjectOffset: Vector3;
  }>();

  return (
    <mesh
      position={[0, 0.95, -0.64]}
      rotation={new Euler(0, 0, 0.5 * Math.PI)}
      onPointerDown={(e) => {
        if (containerRef.current && !downState.current && isXIntersection(e)) {
          e.stopPropagation();
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          downState.current = {
            pointerId: e.pointerId,
            pointToObjectOffset: containerRef.current.position.clone().sub(e.point),
          };
        }
      }}
      onPointerUp={(e) => {
        if (downState.current?.pointerId !== e.pointerId) {
          return;
        }
        downState.current = undefined;
      }}
      onPointerMove={(e) => {
        if (!containerRef.current || !downState.current || e.pointerId !== downState.current.pointerId || !isXIntersection(e)) {
          return;
        }
        containerRef.current.position.copy(downState.current.pointToObjectOffset).add(e.point);
      }}
    >
      <cylinderGeometry args={[0.01, 0.01, 0.3]} />
      <meshStandardMaterial transparent opacity={0.8} color="white" roughness={0.5} />
    </mesh>
  );
};

export default XRHandleBar;
