/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
// Boilerplate code taken from the CRA PWA Typescript template
// https://github.com/cra-template/pwa/blob/main/packages/cra-template-pwa-typescript/template/src/service-worker.ts
// See https://cra.link/PWA for more information

import {clientsClaim} from "workbox-core";
import {precacheAndRoute, createHandlerBoundToURL} from "workbox-precaching";
import {registerRoute} from "workbox-routing";

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// eslint-disable-next-line no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST);

// eslint-disable-next-line prefer-regex-literals
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({request, url}: {request: Request; url: URL}) => {
    // If this isn't a navigation, skip.
    if (request.mode !== "navigate") {
      return false;
    }

    // If this is a URL that starts with /_, skip.
    if (url.pathname.startsWith("/_")) {
      return false;
    }

    // If this looks like a URL for a resource, because it contains
    // a file extension, skip.
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // Return true to signal that we want to use the handler.
    return true;
  },
  createHandlerBoundToURL(`${process.env.PUBLIC_URL}/index.html`)
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Any other custom service worker logic can go here.
