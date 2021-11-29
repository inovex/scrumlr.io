import {fireEvent} from "@testing-library/react";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {LoginProviders} from "components/LoginProviders";
import {render} from "testUtils";

describe("check for all provider buttons", () => {
  test("google sign in", () => {
    const {container} = render(<LoginProviders />);
    expect(container.querySelector("#google")).toBeInTheDocument();
  });

  test("github sign in", () => {
    const {container} = render(<LoginProviders />);
    expect(container.querySelector("#github")).toBeInTheDocument();
  });

  test("microsoft sign in", () => {
    const {container} = render(<LoginProviders />);
    expect(container.querySelector("#microsoft")).toBeInTheDocument();
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
