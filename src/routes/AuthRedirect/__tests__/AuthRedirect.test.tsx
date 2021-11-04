import {API} from "api";
import {Attributes, User} from "parse";
import {render, waitFor} from "@testing-library/react";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import {AuthRedirect} from "routes/AuthRedirect";
import {mocked} from "ts-jest/utils";

jest.mock("api");
jest.mock("parse");

const mockedVerifySignIn = mocked(API.verifySignIn);
const mockedUser = mocked(User, true);

const history = createMemoryHistory();

describe("routing tests", () => {
  test("missing params on page visit -> ErrorPage", () => {
    const {container} = render(
      <Router history={history}>
        <AuthRedirect />
      </Router>
    );
    expect(container.firstChild).toHaveClass("error-page");
  });

  test("error in params -> ErrorPage", () => {
    history.push("?error=params_error");
    const {container} = render(
      <Router history={history}>
        <AuthRedirect />
      </Router>
    );
    expect(container.firstChild).toHaveClass("error-page");
  });

  test("correct params are set -> LoadingScreen", () => {
    history.push("?code=test_code&state=test_state");
    const {container} = render(
      <Router history={history}>
        <AuthRedirect />
      </Router>
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

      mockedVerifySignIn.mockResolvedValue(
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

      mockedUser.mockImplementation(() => user as unknown as User<Attributes>);

      history.push("?code=test_code&state=google-test");
      render(
        <Router history={history}>
          <AuthRedirect />
        </Router>
      );

      await waitFor(() => expect(window.location.href).toEqual(targetURLAfterSuccessfulSignIn));
    });
  });
});
