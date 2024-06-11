/* eslint-disable react/no-unknown-property */
import {Grabbable} from "@coconut-xr/natuerlich/defaults";
import {useFrame, useThree} from "@react-three/fiber";
import {MutableRefObject, forwardRef, useEffect, useImperativeHandle, useRef} from "react";
import {Euler, Group, Object3DEventMap, Vector3} from "three";

type XRHandleBarProps = {
  containerRef: MutableRefObject<Group<Object3DEventMap>>;
};

const currentLookAt = new Vector3();
const targetLookAt = new Vector3();

const XRHandleBar = forwardRef<Group, XRHandleBarProps>(({containerRef}: XRHandleBarProps, ref) => {
  const handleBarRef = useRef<Group>(null!);
  const dragging = useRef(false);
  const {camera} = useThree();

  useImperativeHandle(ref, () => handleBarRef.current, []);

  useEffect(() => {
    currentLookAt.copy(camera.position);
  });

  useFrame((state) => {
    if (!containerRef.current || !handleBarRef.current) return;

    handleBarRef.current.getWorldPosition(containerRef.current.position);
    // containerRef.current.scale.copy(handleBarRef.current.scale);

    if (dragging.current) {
      targetLookAt.copy(state.camera.position);
      containerRef.current.lookAt(currentLookAt.lerp(targetLookAt, 0.1));
      handleBarRef.current.lookAt(currentLookAt.lerp(targetLookAt, 0.1));
    }
  });

  return (
    <Grabbable
      ref={handleBarRef}
      rotation={new Euler(0, 0, 0.5 * Math.PI)}
      onGrabbed={() => {
        dragging.current = true;
      }}
      onReleased={() => {
        dragging.current = false;
      }}
    >
      <mesh position={[-0.6, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3]} />
        <meshStandardMaterial transparent opacity={0.8} color="white" roughness={0.5} />
      </mesh>
    </Grabbable>
  );
});

export default XRHandleBar;
