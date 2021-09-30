import {render} from "@testing-library/react";
import LoginProviders from "./LoginProviders";

describe("Check for all provider buttons", () => {
  test("root element", () => {
    const {container} = render(<LoginProviders />);
    expect(container.firstChild).toHaveClass("login-control");
  });
  test("first button", () => {
    const {container} = render(<LoginProviders />);
    expect(container.firstChild!.childNodes[0].textContent).toEqual("Sign in with Google");
  });
  test("second button", () => {
    const {container} = render(<LoginProviders />);
    expect(container.firstChild!.childNodes[1].textContent).toEqual("Sign in with Github");
  });
  test("third button", () => {
    const {container} = render(<LoginProviders />);
    expect(container.firstChild!.childNodes[2].textContent).toEqual("Sign in with Microsoft");
  });
});
