import {fireEvent, render, screen} from "@testing-library/react";
import LoginProviders from "./LoginProviders";
import {AuthenticationManager} from "../../utils/authentication/AuthenticationManager";

describe("check for all provider buttons", () => {
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

  describe("click-handler", () => {
    const signInSpy = jest.spyOn(AuthenticationManager, "signInWithAuthProvider");

    test("google sign in", () => {
      const {container} = render(<LoginProviders />);
      const button = container.querySelector("#google");
      fireEvent.click(button!);
      expect(signInSpy).toHaveBeenCalledWith("google", expect.anything());
    });

    test("github sign in", () => {
      const {container} = render(<LoginProviders />);
      const button = container.querySelector("#github");
      fireEvent.click(button!);
      expect(signInSpy).toHaveBeenCalledWith("github", expect.anything());
    });

    test("microsoft sign in", () => {
      const {container} = render(<LoginProviders />);
      const button = container.querySelector("#microsoft");
      fireEvent.click(button!);
      expect(signInSpy).toHaveBeenCalledWith("microsoft", expect.anything());
    });
  });
});
