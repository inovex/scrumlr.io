/* eslint-disable react/no-unknown-property */
import {Grabbable} from "@coconut-xr/natuerlich/defaults";
import {useFrame} from "@react-three/fiber";
import {MutableRefObject, forwardRef, useImperativeHandle, useRef} from "react";
import {Euler, Group, Object3DEventMap} from "three";

type XRHandleBarProps = {
  containerRef: MutableRefObject<Group<Object3DEventMap>>;
};

const XRHandleBar = forwardRef<Group, XRHandleBarProps>(({containerRef}: XRHandleBarProps, ref) => {
  const handleBarRef = useRef<Group>(null!);

  useImperativeHandle(ref, () => handleBarRef.current, []);

  useFrame(() => {
    if (handleBarRef?.current) {
      handleBarRef.current.getWorldPosition(containerRef.current.position);
      containerRef.current.rotation.copy(handleBarRef.current.rotation);
      containerRef.current.scale.copy(handleBarRef.current.scale);
    }
  });

  return (
    <Grabbable ref={handleBarRef} rotation={new Euler(0, 0, 0.5 * Math.PI)}>
      <mesh position={[-0.6, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3]} />
        <meshStandardMaterial transparent opacity={0.8} color="white" roughness={0.5} />
      </mesh>
    </Grabbable>
  );
});

export default XRHandleBar;
