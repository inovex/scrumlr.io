import {render, screen} from "@testing-library/react";
import ErrorPage from "./ErrorPage";

describe("error page renders all elements", () => {
  test("root element", () => {
    const {container} = render(<ErrorPage errorMessage="test" originURL="/" />);
    expect(container.firstChild).toHaveClass("error-page");
  });
  test("error message", () => {
    render(<ErrorPage errorMessage="test-message" originURL="/" />);
    expect(screen.getByText(/test-message/i)).toBeInTheDocument();
  });
  test("Home button", () => {
    const {getByTestId} = render(<ErrorPage errorMessage="test" originURL="/" />);
    expect(getByTestId("home-button")).toBeInTheDocument();
  });
  test("Back button", () => {
    const {getByTestId} = render(<ErrorPage errorMessage="test" originURL="/" />);
    expect(getByTestId("back-button")).toBeInTheDocument();
  });
});
