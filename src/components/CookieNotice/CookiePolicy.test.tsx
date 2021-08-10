import {render} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import CookiePolicy from "./CookiePolicy";

const mockStore = configureStore();

const createCookiePolicy = (name: string, func: () => void) => {
  const initialState = {
    cookieConsent: {
      name: "test",
      value: null,
    },
  };
  const store = mockStore(initialState);

  return (
    <Provider store={store}>
      <CookiePolicy scrumlrCookieName={name} acceptFunction={func} />
    </Provider>
  );
};

describe("Cookie Policy should be rendered with:", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        } as unknown as IntersectionObserver)
    );
  });
  test("cookie policy: root node", () => {
    const {container} = render(createCookiePolicy("scrumlr_cookieConsent", () => {}));
    expect(container.firstChild).toHaveClass("cookie-policy");
  });
  test("cookie policy: info-button", () => {
    const {container} = render(createCookiePolicy("scrumlr_cookieConsent", () => {}));
    expect(container.querySelector(".cookie-policy")!.childNodes[0]).toHaveClass(
      "MuiButtonBase-root MuiButton-root MuiButton-outlined cookie-policy__info MuiButton-outlinedPrimary"
    );
  });
});
