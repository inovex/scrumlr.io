import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import Parse from "parse";
import {HeaderMenu} from "./HeaderMenu";

describe("HeaderMenu", () => {
  const mockStore = configureStore();
  const store = mockStore({
    board: {
      data: {
        name: "Header Menu Test",
        showAuthors: true,
        joinConfirmationRequired: true,
        userConfigurations: [{id: "testId", showHiddenColumns: true}],
      },
    },
    users: {
      all: [],
    },
  });

  describe("should render correctly", () => {
    beforeEach(() => {
      Parse.User.current = jest.fn(() => ({id: "testId"}));
    });

    test("on open", () => {
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);

      const {container} = render(
        <Provider store={store}>
          <HeaderMenu open onClose={() => undefined} />
        </Provider>,
        {container: global.document.querySelector("#portal")!}
      );
      expect(container).toMatchSnapshot();
    });

    test("on close", () => {
      const {container} = render(
        <Provider store={store}>
          <HeaderMenu open={false} onClose={() => undefined} />
        </Provider>,
        {container: global.document.querySelector("#portal")!}
      );
      expect(container).toMatchSnapshot();
    });
  });
});
