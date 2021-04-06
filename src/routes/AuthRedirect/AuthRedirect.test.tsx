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
    render(
      <Router history={history}>
        <AuthRedirect />
      </Router>
    );
    expect(API.verifyGoogleSignIn).toHaveBeenCalled();
  });

  test("should show error page if redirect result contains an error", () => {
    const history = createMemoryHistory({initialEntries: ["/error=1"], initialIndex: 0});
    expect(
      render(
        <Router history={history}>
          <AuthRedirect />
        </Router>
      ).container
    ).toMatchSnapshot();
  });

  test("should show error page if page was called with invalid params", () => {
    const history = createMemoryHistory();

    const result = render(
      <Router history={history}>
        <AuthRedirect />
      </Router>
    );
    expect(result.container).toMatchSnapshot();
  });
});
