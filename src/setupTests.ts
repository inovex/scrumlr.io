// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// eslint-disable-next-line import/no-extraneous-dependencies
import MatchMediaMock from "jest-matchmedia-mock";
import "@testing-library/jest-dom";

global.ResizeObserver = require("resize-observer-polyfill");

// jest can't handle match media, and the official workaround doesn't work (lol):
// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
// fortunately, there's a solution:
// https://yarnpkg.com/package?q=jest-matchmedia&name=jest-matchmedia-mock

let matchMedia: MatchMediaMock;

beforeAll(() => {
  matchMedia = new MatchMediaMock();
});

afterAll(() => {
  matchMedia.clear();
});
