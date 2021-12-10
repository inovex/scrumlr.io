import {mocked} from "ts-jest/utils";
import {Session} from "parse";
import {getByTestId} from "@testing-library/dom";
import {waitFor} from "@testing-library/react";
import {RequireAuthentication} from "../RequireAuthentication";
import {render} from "../../testUtils";

jest.mock("parse");
const mockSession = mocked(Session, true);

jest.mock("react-router-dom", () => ({
  Navigate: () => <div>Error</div>,
}));

describe("RequireAuthentication", () => {
  test("show loading screen while session is being verified", () => {
    mockSession.current = (() => new Promise<Session>(() => {})) as never;

    const {container} = render(<RequireAuthentication />);

    expect(container.querySelector(".loading-screen")).toBeDefined();
  });

  test("show children on valid session", async () => {
    mockSession.current = (() =>
      new Promise<Session>((resolve) => {
        resolve(new Session());
      })) as never;

    const {container} = render(
      <RequireAuthentication>
        <div data-testid="test">Test</div>
      </RequireAuthentication>
    );

    await waitFor(() => {
      expect(getByTestId(container, "test")).toBeDefined();
    });
  });

  test("show login screen on invalid session", async () => {
    mockSession.current = (() =>
      new Promise<Session>((_, reject) => {
        reject(new Error("Invalid session"));
      })) as never;

    const {container} = render(<RequireAuthentication>Should not see this</RequireAuthentication>);
    await waitFor(() => {
      expect(container).toHaveTextContent("Error");
    });
  });
});
