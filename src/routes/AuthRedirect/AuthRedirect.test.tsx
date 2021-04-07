import {API} from "api";
import {render} from "@testing-library/react";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import AuthRedirect from "./AuthRedirect";

jest.mock("api", () => {
  return {
    API: {
      verifyGoogleSignIn: jest.fn(),
    },
  };
});

beforeEach(() => {
  (API.verifyGoogleSignIn as jest.Mock).mockClear();
});

describe("AuthRedirect", () => {
  test("should render loading screen while waiting for server", () => {
    (API.verifyGoogleSignIn as jest.Mock).mockReturnValue({then: () => {}});

    const history = createMemoryHistory({initialEntries: ["/test?code=1&state=1"], initialIndex: 0});
    const result = render(
      <Router history={history}>
        <AuthRedirect />
      </Router>
    ).container;
    expect(API.verifyGoogleSignIn).toHaveBeenCalled();
    expect(result.querySelector(".loading-screen")).toBeInTheDocument();
  });

  test("should show error page if redirect result contains an error", () => {
    const history = createMemoryHistory({initialEntries: ["/error=1"], initialIndex: 0});

    const result = render(
      <Router history={history}>
        <AuthRedirect />
      </Router>
    ).container;

    expect(result.querySelector(".error-page")).toBeInTheDocument();
  });

  test("should show error page if page was called with invalid params", () => {
    const history = createMemoryHistory();

    const result = render(
      <Router history={history}>
        <AuthRedirect />
      </Router>
    ).container;

    expect(result.querySelector(".error-page")).toBeInTheDocument();
  });
});
