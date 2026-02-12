import {fireEvent} from "@testing-library/react";
import {Auth} from "utils/auth";
import {LoginProviders} from "components/LoginProviders";
import {render} from "testUtils";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import getTestApplicationState from "utils/test/getTestApplicationState";

describe("check for all provider buttons", () => {
  const createLoginProviders = (providers?: string[]) => (
    <Provider
      store={getTestStore({
        view: {
          ...getTestApplicationState().view,
          enabledAuthProvider: providers ?? [],
        },
      })}
    >
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
    expect(container.querySelector("#microsoft")).not.toBeInTheDocument();
    expect(container.querySelector("#oidc")).not.toBeInTheDocument();
  });

  test("microsoft sign in", () => {
    const {container} = render(createLoginProviders(["MICROSOFT"]));
    expect(container.querySelector("#google")).not.toBeInTheDocument();
    expect(container.querySelector("#microsoft")).toBeInTheDocument();
    expect(container.querySelector("#oidc")).not.toBeInTheDocument();
  });

  test("oidc sign in", () => {
    const {container} = render(createLoginProviders(["OIDC"]));
    expect(container.querySelector("#google")).not.toBeInTheDocument();
    expect(container.querySelector("#microsoft")).not.toBeInTheDocument();
    expect(container.querySelector("#oidc")).toBeInTheDocument();
  });

  describe("click-handler", () => {
    const signInSpy = vi.spyOn(Auth, "signInWithAuthProvider");

    test("google sign in", () => {
      const {container} = render(createLoginProviders(["GOOGLE"]));
      const button = container.querySelector("#google");
      fireEvent.click(button!);
      expect(signInSpy).toHaveBeenCalledWith("google", expect.anything());
    });

    test("microsoft sign in", () => {
      const {container} = render(createLoginProviders(["MICROSOFT"]));
      const button = container.querySelector("#microsoft");
      fireEvent.click(button!);
      expect(signInSpy).toHaveBeenCalledWith("microsoft", expect.anything());
    });

    test("oidc sign in", () => {
      const {container} = render(createLoginProviders(["OIDC"]));
      const button = container.querySelector("#oidc");
      fireEvent.click(button!);
      expect(signInSpy).toHaveBeenCalledWith("oidc", expect.anything());
    });
  });
});
