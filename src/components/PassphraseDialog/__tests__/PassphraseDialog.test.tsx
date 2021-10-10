import {fireEvent, render, waitFor} from "@testing-library/react";
import PassphraseDialog from "../PassphraseDialog";

describe("<PassphraseDialog />", () => {
  test("error is not visible in default state", () => {
    const {container} = render(<PassphraseDialog onPassphrase={jest.fn()} />);
    expect(container.querySelector(".passphrase-dialog__error")).toBeNull();
  });

  test("show error on invalid passphrase", async () => {
    const {container} = render(<PassphraseDialog onPassphrase={() => Promise.resolve(false)} />);
    fireEvent.click(container.querySelector('button[type="submit"]')!);

    await waitFor(() => {
      expect(container.querySelector(".passphrase-dialog__error")).toBeDefined();
    });
  });

  test("set aria props on invalid passphrase", async () => {
    const {container} = render(<PassphraseDialog onPassphrase={() => Promise.resolve(false)} />);
    fireEvent.click(container.querySelector('button[type="submit"]')!);

    await waitFor(() => {
      const passphraseElement = container.querySelector("#passphrase")!;
      expect(passphraseElement.getAttribute("aria-invalid")).toEqual("true");
      expect(passphraseElement.getAttribute("aria-describedby")).toEqual("passphrase-error");
    });
  });

  test("passphrase is not visible in default state", () => {
    const {container} = render(<PassphraseDialog onPassphrase={jest.fn()} />);
    expect(container.querySelector("#passphrase")!.getAttribute("type")).toEqual("password");
  });

  test("passphrase is visible on visibility toggle", async () => {
    const {container} = render(<PassphraseDialog onPassphrase={jest.fn()} />);
    fireEvent.click(container.querySelector('button[aria-label="Toggle passphrase visibility"]')!);
    await waitFor(() => {
      expect(container.querySelector("#passphrase")!.getAttribute("type")).toEqual("text");
    });
  });

  test("aria pressed state is correct on visibility toggle", async () => {
    const {container} = render(<PassphraseDialog onPassphrase={jest.fn()} />);
    const toggleButton = container.querySelector('button[aria-label="Toggle passphrase visibility"]')!;

    expect(toggleButton.getAttribute("aria-pressed")).toEqual("false");

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleButton.getAttribute("aria-pressed")).toEqual("true");
    });
  });

  test("manual verification is visible", () => {
    const {container} = render(<PassphraseDialog onPassphrase={jest.fn()} />);
    expect(container.querySelector(".passphrase-dialog__manual-verification")).toBeNull();
  });

  test("manual verification is not visible", () => {
    const {container} = render(<PassphraseDialog manualVerificationAvailable onPassphrase={jest.fn()} />);
    expect(container.querySelector(".passphrase-dialog__manual-verification")).toBeDefined();
  });
});
