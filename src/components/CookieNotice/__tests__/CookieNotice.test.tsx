import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {CookieNotice} from "components/CookieNotice";

describe("Cookie Notice should be rendered with:", () => {
  const mockStore = configureStore();
  const initialState = {
    cookieConsent: {
      name: null,
      value: null,
    },
  };
  const store = mockStore(initialState);

  test("cookie notice: header", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    const {container} = render(
      <Provider store={store}>
        <CookieNotice />
      </Provider>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.querySelector(".cookie-notice")!.childNodes[0]).toHaveClass("cookie-notice__header");
  });

  test("cookie notice: body", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    const {container} = render(
      <Provider store={store}>
        <CookieNotice />
      </Provider>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.querySelector(".cookie-notice")!.childNodes[1]).toHaveClass("cookie-notice__body");
  });

  test("cookie notice: buttons section", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    const {container} = render(
      <Provider store={store}>
        <CookieNotice />
      </Provider>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.querySelector(".cookie-notice")!.childNodes[2]).toHaveClass("cookie-notice__buttons");
  });

  test("cookie notice: cookie policy button", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    const {container} = render(
      <Provider store={store}>
        <CookieNotice />
      </Provider>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.querySelector(".cookie-notice")!.childNodes[2]!.childNodes[0]).toHaveClass("cookie-notice__button-cookie-policy");
  });

  test("cookie notice: decline button", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    const {container} = render(
      <Provider store={store}>
        <CookieNotice />
      </Provider>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.querySelector(".cookie-notice")!.childNodes[2]!.childNodes[1]).toHaveClass("cookie-notice__button-decline");
  });

  test("cookie notice: accept button", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    const {container} = render(
      <Provider store={store}>
        <CookieNotice />
      </Provider>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.querySelector(".cookie-notice")!.childNodes[2]!.childNodes[2]).toHaveClass("cookie-notice__button-accept");
  });
});
