import {render, screen} from "@testing-library/react";
import LoginProviders from "./LoginProviders";

describe("Check for all provider buttons", () => {
  test("root element", () => {
    const {container} = render(<LoginProviders />);
    expect(container.firstChild).toHaveClass("login-control");
  });
  test("google sign in", () => {
    render(<LoginProviders />);
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
  });
  test("github sign in", () => {
    render(<LoginProviders />);
    expect(screen.getByText(/Sign in with Github/i)).toBeInTheDocument();
  });
  test("microsoft sign in", () => {
    render(<LoginProviders />);
    expect(screen.getByText(/Sign in with Microsoft/i)).toBeInTheDocument();
  });
});
