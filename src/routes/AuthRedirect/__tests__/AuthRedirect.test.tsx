import {API} from "api";
import Parse from "parse";
import {render, waitFor} from "@testing-library/react";

import {MemoryRouter} from "react-router";
import {AuthRedirect} from "routes/AuthRedirect";

jest.mock("api");
jest.mock("parse");

describe("routing tests", () => {
  test("missing params on page visit -> ErrorPage", () => {
    const {container} = render(
      <MemoryRouter>
        <AuthRedirect />
      </MemoryRouter>
    );
    expect(container.firstChild).toHaveClass("error-page");
  });

  test("error in params -> ErrorPage", () => {
    const {container} = render(
      <MemoryRouter initialEntries={["?error=params_error"]}>
        <AuthRedirect />
      </MemoryRouter>
    );
    expect(container.firstChild).toHaveClass("error-page");
  });

  test("correct params are set -> LoadingScreen", () => {
    const {container} = render(
      <MemoryRouter initialEntries={["?code=test_code&state=test_state"]}>
        <AuthRedirect />
      </MemoryRouter>
    );
    expect(container.firstChild).toHaveClass("loading-screen");
  });

  describe("successful sign-in", () => {
    beforeEach(() => {
      global.window = Object.create(window);
      const url = "http://test-root.com";
      Object.defineProperty(window, "location", {
        value: {
          href: url,
        },
        writable: true,
      });
    });

    test("redirect user on successful sign in", async () => {
      const targetURLAfterSuccessfulSignIn = "http://destiny.com";

      API.verifySignIn.mockResolvedValue(
        new Promise((resolve) => {
          resolve({
            user: {
              id: "123",
              accessToken: "access_token",
              idToken: "token",
              name: "John Doe",
            },
            redirectURL: targetURLAfterSuccessfulSignIn,
          });
        })
      );

      const user = {
        linkWith: jest.fn().mockReturnValue(Promise.resolve(true)),
        set: jest.fn(),
        save: jest.fn().mockReturnValue(Promise.resolve(true)),
      };

      Parse.User.mockImplementation(() => user);

      render(
        <MemoryRouter initialEntries={["?code=test_code&state=google-test"]}>
          <AuthRedirect />
        </MemoryRouter>
      );

      await waitFor(() => expect(window.location.href).toEqual(targetURLAfterSuccessfulSignIn));
    });
  });
});
