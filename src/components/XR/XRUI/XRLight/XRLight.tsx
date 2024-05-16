/* eslint-disable react/no-unknown-property */
const XRLight = () => (
  // TODO: use webXR lighting estimation module
  <>
    <ambientLight />
    <directionalLight intensity={5} />
  </>
);
export default XRLight;
