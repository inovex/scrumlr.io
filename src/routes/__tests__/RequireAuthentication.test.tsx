import {getByTestId} from "@testing-library/dom";
import {waitFor} from "@testing-library/react";
import {RequireAuthentication} from "../RequireAuthentication";
import {render} from "testUtils";
import {ApplicationState} from "../../types";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Navigate: () => <div>Error</div>,
}));

const createRequireAuthentication = (overwrite?: Partial<ApplicationState>) => (
  <Provider store={getTestStore(overwrite)}>
    <RequireAuthentication>
      <div data-testid="test">Test</div>
    </RequireAuthentication>
  </Provider>
);

describe("RequireAuthentication", () => {
  test("show loading screen while session is being verified", () => {
    const {container} = render(createRequireAuthentication({auth: {initializationSucceeded: null, user: undefined}}));
    expect(container.querySelector(".loading-screen")).toBeDefined();
  });

  test("show children on valid session", async () => {
    const {container} = render(createRequireAuthentication({auth: {initializationSucceeded: true, user: {id: "test", name: "test"}}}));

    await waitFor(() => {
      expect(getByTestId(container, "test")).toBeDefined();
    });
  });

  test("show login screen on invalid session", async () => {
    const {container} = render(createRequireAuthentication({auth: {initializationSucceeded: true, user: undefined}}));
    await waitFor(() => {
      expect(container).toHaveTextContent("Error");
    });
  });
});
