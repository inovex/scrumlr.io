import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import CookieNotice from "./CookieNotice";

const mockStore = configureStore();

const createCookieNotice = () => {
  const initialState = {
    cookieConsent: {
      name: null,
      value: null,
    },
  };
  const store = mockStore(initialState);

  return (
    <Provider store={store}>
      <CookieNotice />
    </Provider>
  );
};

describe("Cookie Notice should be rendered with:", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        } as unknown as IntersectionObserver)
    );
  });
  test("cookie notice: root node", () => {
    const {container} = render(createCookieNotice());
    expect(container.firstChild).toHaveClass("cookie-notice--show");
  });
  test("cookie notice: backdrop", () => {
    const {container} = render(createCookieNotice());
    expect(container.querySelector(".cookie-notice--show")!.childNodes[0]).toHaveClass("MuiBackdrop-root cookie-notice__backdrop MuiBackdrop-invisible");
  });
  test("cookie notice: header", () => {
    const {container} = render(createCookieNotice());
    expect(container.querySelector(".cookie-notice--show")!.childNodes[1]).toHaveClass("cookie-notice__header");
  });
  test("cookie notice: body", () => {
    const {container} = render(createCookieNotice());
    expect(container.querySelector(".cookie-notice--show")!.childNodes[2]).toHaveClass("cookie-notice__body");
  });
  test("cookie notice: buttons section", () => {
    const {container} = render(createCookieNotice());
    expect(container.querySelector(".cookie-notice--show")!.childNodes[3]).toHaveClass("cookie-notice__buttons");
  });
});
