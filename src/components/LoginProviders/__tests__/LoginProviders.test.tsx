import {fireEvent} from "@testing-library/react";
import {Auth} from "utils/auth";
import {LoginProviders} from "components/LoginProviders";
import {render} from "testUtils";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";

describe("check for all provider buttons", () => {
  const createLoginProviders = (providers?: string[]) => (
    <Provider store={getTestStore({view: {enabledAuthProvider: providers ?? [], serverTimeOffset: 0, moderating: false}})}>
      <LoginProviders />
    </Provider>
  );

  test("no enabled login provider", () => {
    const {container} = render(createLoginProviders());
    expect(container.firstChild).toBeNull();
  });

  test("google sign in", () => {
    const {container} = render(createLoginProviders(["GOOGLE"]));
    expect(container.querySelector("#google")).toBeInTheDocument();
    expect(container.querySelector("#github")).not.toBeInTheDocument();
    expect(container.querySelector("#microsoft")).not.toBeInTheDocument();
    expect(container.querySelector("#apple")).not.toBeInTheDocument();
  });

  test("github sign in", () => {
    const {container} = render(createLoginProviders(["GITHUB"]));
    expect(container.querySelector("#google")).not.toBeInTheDocument();
    expect(container.querySelector("#github")).toBeInTheDocument();
    expect(container.querySelector("#microsoft")).not.toBeInTheDocument();
    expect(container.querySelector("#apple")).not.toBeInTheDocument();
  });

  test("microsoft sign in", () => {
    const {container} = render(createLoginProviders(["MICROSOFT"]));
    expect(container.querySelector("#google")).not.toBeInTheDocument();
    expect(container.querySelector("#github")).not.toBeInTheDocument();
    expect(container.querySelector("#microsoft")).toBeInTheDocument();
    expect(container.querySelector("#apple")).not.toBeInTheDocument();
  });

  test("apple sign in", () => {
    const {container} = render(createLoginProviders(["APPLE"]));
    expect(container.querySelector("#google")).not.toBeInTheDocument();
    expect(container.querySelector("#github")).not.toBeInTheDocument();
    expect(container.querySelector("#microsoft")).not.toBeInTheDocument();
    expect(container.querySelector("#apple")).toBeInTheDocument();
  });

  describe("click-handler", () => {
    const signInSpy = jest.spyOn(Auth, "signInWithAuthProvider");

    test("google sign in", () => {
      const {container} = render(createLoginProviders(["GOOGLE"]));
      const button = container.querySelector("#google");
      fireEvent.click(button!);
      expect(signInSpy).toHaveBeenCalledWith("google", expect.anything());
    });

    test("github sign in", () => {
      const {container} = render(createLoginProviders(["GITHUB"]));
      const button = container.querySelector("#github");
      fireEvent.click(button!);
      expect(signInSpy).toHaveBeenCalledWith("github", expect.anything());
    });

    test("microsoft sign in", () => {
      const {container} = render(createLoginProviders(["MICROSOFT"]));
      const button = container.querySelector("#microsoft");
      fireEvent.click(button!);
      expect(signInSpy).toHaveBeenCalledWith("microsoft", expect.anything());
    });

    test("apple sign in", () => {
      const {container} = render(createLoginProviders(["APPLE"]));
      const button = container.querySelector("#apple");
      fireEvent.click(button!);
      expect(signInSpy).toHaveBeenCalledWith("apple", expect.anything());
    });
  });
});
