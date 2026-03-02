// Workaround for JSDOM not having implemented matchMedia yet
// See https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom for more details
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

export {};
