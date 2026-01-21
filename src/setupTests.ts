// vitest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
import { vi, expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock;

Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
  get() {
    return 0;
  },
});
Object.defineProperty(HTMLElement.prototype, "offsetTop", {
  get() {
    return 0;
  },
});
Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  get() {
    return null;
  },
});

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
