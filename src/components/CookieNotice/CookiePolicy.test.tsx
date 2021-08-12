import {render} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import CookiePolicy from "./CookiePolicy";

describe("Cookie Policy should be rendered with:", () => {
  const mockStore = configureStore();
  const store = mockStore({
    name: "test",
    value: null,
  });

  test("cookie policy: title", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    const {container} = render(
      <Provider store={store}>
        <CookiePolicy scrumlrCookieName="scrumlr_cookieConsent" acceptFunction={() => {}} onClose={() => {}} show />
      </Provider>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.querySelector(".cookie-policy")!.childNodes[0]).toHaveClass("cookie-policy__title");
  });

  test("cookie policy: body", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    const {container} = render(
      <Provider store={store}>
        <CookiePolicy scrumlrCookieName="scrumlr_cookieConsent" acceptFunction={() => {}} onClose={() => {}} show />
      </Provider>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.querySelector(".cookie-policy")!.childNodes[1]).toHaveClass("cookie-policy__body");
  });

  test("cookie policy: footer", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    const {container} = render(
      <Provider store={store}>
        <CookiePolicy scrumlrCookieName="scrumlr_cookieConsent" acceptFunction={() => {}} onClose={() => {}} show />
      </Provider>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.querySelector(".cookie-policy")!.childNodes[2]).toHaveClass("cookie-policy__footer");
  });

  test("cookie policy: accept button", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    const {container} = render(
      <Provider store={store}>
        <CookiePolicy scrumlrCookieName="scrumlr_cookieConsent" acceptFunction={() => {}} onClose={() => {}} show />
      </Provider>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.querySelector(".cookie-policy__footer")!.childNodes[0]).toHaveClass("cookie-policy__button-accept");
  });
});
