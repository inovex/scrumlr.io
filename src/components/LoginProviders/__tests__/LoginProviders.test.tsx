import {fireEvent} from "@testing-library/react";
import {Auth} from "utils/auth";
import {LoginProviders} from "components/LoginProviders";
import {render} from "testUtils";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";

describe("check for all provider buttons", () => {
  const createLoginProviders = (providers?: string[]) => (
    <Provider
      store={getTestStore({
        view: {
          enabledAuthProvider: providers ?? [],
          serverTimeOffset: 0,
          moderating: false,
          feedbackEnabled: false,
          showBoardReactions: true,
          noteFocused: false,
          hotkeyNotificationsEnabled: true,
          hotkeysAreActive: false,
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
  });

  test("microsoft sign in", () => {
    const {container} = render(createLoginProviders(["MICROSOFT"]));
    expect(container.querySelector("#google")).not.toBeInTheDocument();
    expect(container.querySelector("#microsoft")).toBeInTheDocument();
  });

  describe("click-handler", () => {
    const signInSpy = jest.spyOn(Auth, "signInWithAuthProvider");

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
  });
});
