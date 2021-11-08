import {fireEvent, render, waitFor} from "@testing-library/react";
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
      fireEvent.change(container.querySelector("#passphrase")!, {target: {value: "1234"}});

      await waitFor(() => {
        expect(container.querySelector(".passphrase-dialog__submit-button")!.hasAttribute("disabled")).toBeFalsy();
      });
    });
  });

  describe("visibility toggle", () => {
    test("passphrase is not visible in default state", () => {
      const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
      expect(container.querySelector("#passphrase")!.getAttribute("type")).toEqual("password");
    });

    test("passphrase is visible on visibility toggle", async () => {
      const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
      fireEvent.click(container.querySelector('button[aria-label="Toggle passphrase visibility"]')!);
      await waitFor(() => {
        expect(container.querySelector("#passphrase")!.getAttribute("type")).toEqual("text");
      });
    });

    test("aria pressed state is correct on visibility toggle", async () => {
      const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
      const toggleButton = container.querySelector('button[aria-label="Toggle passphrase visibility"]')!;

      expect(toggleButton.getAttribute("aria-pressed")).toEqual("false");

      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton.getAttribute("aria-pressed")).toEqual("true");
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
