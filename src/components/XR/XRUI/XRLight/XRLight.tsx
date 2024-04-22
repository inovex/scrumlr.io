const XRLight = () => 
  // TODO: use webXR lighting estimation module
   (
    <>
      <ambientLight />
      <pointLight position={[-10, -10, -10]} color="red" intensity={10} />
      <directionalLight intensity={5} />
    </>
  )
;

export default XRLight;
