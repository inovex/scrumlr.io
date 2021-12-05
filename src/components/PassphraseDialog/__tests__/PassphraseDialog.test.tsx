import {fireEvent, waitFor} from "@testing-library/react";
import {render} from "testUtils";
import {PassphraseDialog} from "../PassphraseDialog";

describe("<PassphraseDialog />", () => {
  test("snapshot test", () => {
    const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  describe("passphrase input", () => {
    test("submit is disabled while passphrase is empty", () => {
      const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
      expect(container.querySelector(".passphrase-dialog__submit-button")!.hasAttribute("disabled")).toBeTruthy();
    });

    test("submit is available if passphrase is set", async () => {
      const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
      fireEvent.change(container.querySelector("#password-dialog__password")!, {target: {value: "1234"}});

      await waitFor(() => {
        expect(container.querySelector(".passphrase-dialog__submit-button")!.hasAttribute("disabled")).toBeFalsy();
      });
    });
  });

  describe("visibility toggle", () => {
    test("passphrase is not visible in default state", () => {
      const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
      expect(container.querySelector("#password-dialog__password")!.getAttribute("type")).toEqual("password");
    });

    test("passphrase is visible on visibility toggle", async () => {
      const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
      fireEvent.click(container.querySelector('button[aria-label="Toggle passphrase visibility"]')!);
      await waitFor(() => {
        expect(container.querySelector("#password-dialog__password")!.getAttribute("type")).toEqual("text");
      });
    });
  });

  describe("manual verification hint", () => {
    test("manual verification is visible", () => {
      const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
      expect(container.querySelector(".passphrase-dialog__manual-verification")).toBeNull();
    });

    test("manual verification is not visible", () => {
      const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
      expect(container.querySelector(".passphrase-dialog__manual-verification")).toBeDefined();
    });
  });
});
