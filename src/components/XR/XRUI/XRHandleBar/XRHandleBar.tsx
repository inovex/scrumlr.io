/* eslint-disable react/no-unknown-property */
import {Grabbable} from "@coconut-xr/natuerlich/defaults";
import {useFrame, useThree} from "@react-three/fiber";
import {MutableRefObject, forwardRef, useEffect, useImperativeHandle, useRef} from "react";
import {Euler, Group, Material, Mesh, Object3DEventMap, Vector3} from "three";

type XRHandleBarProps = {
  containerRef: MutableRefObject<Group<Object3DEventMap>>;
};

const currentLookAt = new Vector3();
const targetLookAt = new Vector3();
const BAR_OPACITY = 0.6;

const XRHandleBar = forwardRef<Group, XRHandleBarProps>(({containerRef}: XRHandleBarProps, ref) => {
  const handleBarRef = useRef<Group>(null!);
  const visibleBarRef = useRef<Mesh>(null!);
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
      handleBarRef.current.scale.set(1, 1, 1);
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
      onPointerEnter={() => {
        if (visibleBarRef.current.material[0]) visibleBarRef.current.material[0].opacity = 1;
        else (visibleBarRef.current.material as Material).opacity = 1;
      }}
      onPointerLeave={() => {
        if (visibleBarRef.current.material[0]) visibleBarRef.current.material[0].opacity = BAR_OPACITY;
        else (visibleBarRef.current.material as Material).opacity = BAR_OPACITY;
      }}
    >
      <group>
        <mesh position={[-0.53, 0, 0]} visible={false}>
          <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        </mesh>
        <mesh position={[-0.53, 0, 0]} ref={visibleBarRef}>
          <cylinderGeometry args={[0.01, 0.01, 0.3]} />
          <meshStandardMaterial transparent opacity={BAR_OPACITY} color="white" roughness={0.5} />
        </mesh>
        <mesh position={[0.46, 0, 0]} visible={false}>
          <boxGeometry args={[0.075, 2, 0]} />
        </mesh>
      </group>
    </Grabbable>
  );
});

export default XRHandleBar;
