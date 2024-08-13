# @coconut-xr/natuerlich

[![Version](https://img.shields.io/npm/v/@coconut-xr/natuerlich?style=flat-square)](https://npmjs.com/package/@coconut-xr/natuerlich)
[![License](https://img.shields.io/github/license/coconut-xr/natuerlich.svg?style=flat-square)](https://github.com/coconut-xr/natuerlich/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/coconut_xr?style=flat-square)](https://twitter.com/coconut_xr)
[![Discord](https://img.shields.io/discord/1087727032240185424?style=flat-square&label=discord)](https://discord.gg/RbyaXJJaJM)

<img src="./docs/static/images/header.jpg" width="100%">


_WebXR Interaction for Three.js_

This library builds on [Three.js](https://github.com/mrdoob/three.js) (open-source WebGL library) and [WebXR](https://immersiveweb.dev/) (Web Standard for Augmented and Virtual Reality) to deliver **composable and extensible interactions for immersive experiences** .

We provide bindings to [react-three/fiber](https://github.com/pmndrs/react-three-fiber), enabling a **familiar Developer Experience** for react developers.

`npm install @coconut-xr/natuerlich`

## Check out the [Getting Started](https://coconut-xr.github.io/natuerlich/getting-started)

## Examples

| | |
| --- | --- | 
| <a href="https://codesandbox.io/s/natuerlich-spatual-ui-example-xmdpvq?file=/src/app.tsx">Spatial UI with Koestlich</a> | <a href="https://codesandbox.io/s/natuerlich-placing-objects-3q74pk?file=/src/app.tsx">Placing Objects </a> - 3D Models from [Quaternius](https://quaternius.com/) |
| <a href="https://codesandbox.io/s/natuerlich-spatual-ui-example-xmdpvq?file=/src/app.tsx"><img src="./docs/static/images/spatial-ui-example.gif" width="100%"></a>| <a href="https://codesandbox.io/s/natuerlich-placing-objects-3q74pk?file=/src/app.tsx"><img src="./docs/static/images/placing-objects.gif" width="100%"></a>  |
| <a href="https://codesandbox.io/s/natuerlich-ragdoll-physics-j2q7mc?file=/src/App.js">Rag Doll Physics </a> - based on [R3F Example](https://codesandbox.io/s/wdzv4) | <a href="https://coconut-xr.github.io/auto/">Auto Demo - VR Drift Racing</a> |
| <a href="https://codesandbox.io/s/natuerlich-ragdoll-physics-j2q7mc?file=/src/App.js"><img src="./docs/static/images/rag-doll.gif" width="100%"></a>| <a href="https://coconut-xr.github.io/auto/"><img src="./docs/static/images/car.gif" width="100%"></a> |
| <a href="https://coconut-xr.github.io/klettern/">Klettern Demo - VR Climbing</a> | <a href="https://codesandbox.io/s/natuerlich-gamepad-api-example-l48gx5">Gamepad Example</a>  |
| <a href="https://coconut-xr.github.io/klettern/"><img src="./docs/static/images/klettern.gif" width="100%"></a>|<a href="https://codesandbox.io/s/natuerlich-gamepad-api-example-l48gx5"><img src="./docs/static/images/gamepad-api.gif" width="100%"></a>|

## [Documentation](https://coconut-xr.github.io/natuerlich/)

| | |
| --- | --- |
| <a href="https://coconut-xr.github.io/natuerlich/getting-started">Getting Started - barebones WebXR, Hands, and Controllers</a> | <a href="https://coconut-xr.github.io/natuerlich/object-interaction">Interaction with Objects - build interactions with objects</a>|
| <a href="https://coconut-xr.github.io/natuerlich/getting-started"><img src="./docs/static/images/barebones.gif" width="70%"></a>| <a href="https://coconut-xr.github.io/natuerlich/object-interaction"><img src="./docs/static/images/object-draggable.gif" width="70%"></a> |
| <a href="https://coconut-xr.github.io/natuerlich/koestlich-interaction">Interaction with Koestlich - build interactive 3D UIs</a> | <a href="https://coconut-xr.github.io/natuerlich/teleport">Teleport - building a teleport interaction</a> |
| <a href="https://coconut-xr.github.io/natuerlich/koestlich-interaction"><img src="./docs/static/images/koestlich-interactable.gif" width="70%"></a> | <a href="https://coconut-xr.github.io/natuerlich/teleport"><img src="./docs/static/images/teleport.gif" width="70%"></a>|
| <a href="https://coconut-xr.github.io/natuerlich/poses">Poses - detecting and generating hand poses</a> |  <a href="https://coconut-xr.github.io/natuerlich/layers">Layers - high quality content using WebXR layers</a>|
| <a href="https://coconut-xr.github.io/natuerlich/poses"><img src="./docs/static/images/poses.gif" width="70%"></a>| <a href="https://coconut-xr.github.io/natuerlich/layers"><img src="./docs/static/images/layer.gif" width="70%"></a>|
| <a href="https://coconut-xr.github.io/natuerlich/anchors">Anchors - spatial anchors using WebXR anchors</a> | <a href="https://coconut-xr.github.io/natuerlich/tracked-planes">Tracked Planes - tracked room planes using WebXR planes</a>|
| <a href="https://coconut-xr.github.io/natuerlich/anchors"><img src="./docs/static/images/anchor.gif" width="70%"></a>| <a href="https://coconut-xr.github.io/natuerlich/tracked-planes"><img src="./docs/static/images/tracked-planes.gif" width="70%"></a>|
| <a href="https://coconut-xr.github.io/natuerlich/head-up-display">Head Up Display - placing content in front of the user's camera</a>| <a href="https://coconut-xr.github.io/natuerlich/custom-input-sources">Custom Input Sources - building custom interactive hands and controllers</a>|
| <a href="https://coconut-xr.github.io/natuerlich/head-up-display"><img src="./docs/static/images/head-up-display.gif" width="70%"></a> | <a href="https://coconut-xr.github.io/natuerlich/custom-input-sources"><img src="./docs/static/images/fist-grab-hand.gif" width="70%"></a>|
|  <a href="https://coconut-xr.github.io/natuerlich/tracked-images"> Tracked Images - <br></br> image marker tracking using WebXR Image Tracking </a>| <a href="https://coconut-xr.github.io/natuerlich/guards">Guards - <br></br> conditional rendering using guards </a>|
| <a href="https://coconut-xr.github.io/natuerlich/use-xr"> Use XR - <br></br> accessing the raw XR state </a>| <a href="https://coconut-xr.github.io/natuerlich/configuration">Configuration - <br></br> configuring foveation, frameRate, referenceSpace, and frameBufferScaling </a>|
| | |
---

- <a href="https://coconut-xr.github.io/natuerlich/all-components">All Components - API Documentation for all available components</a>

- <a href="https://coconut-xr.github.io/natuerlich/all-hooks">All Hooks - API Documentation for all available hooks</a>

## Acknowledgements

This library is only possible because of the great efforts from the [Immersive Web Community Group and Immersive Web Working Group at the W3C](https://github.com/immersive-web), the [Three.js](https://github.com/mrdoob/three.js) team, and the [react-three-fiber](https://github.com/pmndrs/react-three-fiber) team. This work is inspired by existing libraries, such as [react-xr](https://github.com/pmndrs/react-xr) and [handy-work](https://github.com/AdaRoseCannon/handy-work).

**natuerlich** is funded by [Coconut Capital](https://coconut.capital/)
