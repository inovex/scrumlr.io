import {render, screen} from "@testing-library/react";
import {ErrorPage} from "components/ErrorPage";
import {MemoryRouter} from "react-router";

describe("error page renders all elements", () => {
  test("root element", () => {
    const {container} = render(
      <MemoryRouter>
        <ErrorPage errorMessage="test" originURL="/" />
      </MemoryRouter>
    );
    expect(container.firstChild).toHaveClass("error-page");
  });
  test("error message", () => {
    render(
      <MemoryRouter>
        <ErrorPage errorMessage="test-message" originURL="/" />
      </MemoryRouter>
    );
    expect(screen.getByText(/test-message/i)).toBeInTheDocument();
  });
  test("Home button", () => {
    const {getByTestId} = render(
      <MemoryRouter>
        <ErrorPage errorMessage="test" originURL="/" />
      </MemoryRouter>
    );
    expect(getByTestId("home-button")).toBeInTheDocument();
  });
  test("Back button", () => {
    const {getByTestId} = render(
      <MemoryRouter>
        <ErrorPage errorMessage="test" originURL="/" />
      </MemoryRouter>
    );
    expect(getByTestId("back-button")).toBeInTheDocument();
  });
});
