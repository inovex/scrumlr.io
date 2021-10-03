import {render} from "@testing-library/react";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import AuthRedirect from "./AuthRedirect";

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
});
