// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { vi } from "vitest";
/*

// import {TextEncoder} from "util";

import ResizeObserver from "resize-observer-polyfill";

global.ResizeObserver = ResizeObserver

// global.TextDecoder = require('util').TextDecoder;
global.TextEncoder = TextEncoder;

// jest can't handle match media, and the official workaround doesn't work (lol):
// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
// the package to mock it correctly almost works, but not quite:
// https://yarnpkg.com/package?q=jest-matchmedia&name=jest-matchmedia-mock
// fortunately, this seems to do the trick:
// https://github.com/facebook/create-react-app/issues/10126#issuecomment-735272763
*/

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock;

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});
