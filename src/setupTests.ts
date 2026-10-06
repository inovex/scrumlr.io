import {vi} from "vitest";
import "@testing-library/jest-dom/vitest"; // implicitly invokes expect.extend for DOM matchers
import {LocalStorage} from "node-localstorage";
import path from "path";

// local storage
const LOCALE_STORAGE_PATH = path.resolve(__dirname, "utils/test/localstorage");
vi.stubGlobal("localStorage", new LocalStorage(LOCALE_STORAGE_PATH));

// mock resize observer
class ResizeObserverMock {
  observe = vi.fn();

  unobserve = vi.fn();

  disconnect = vi.fn();
}
globalThis.ResizeObserver = ResizeObserverMock;

globalThis.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// happy dom doesn't support all properties; so we define them here
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
