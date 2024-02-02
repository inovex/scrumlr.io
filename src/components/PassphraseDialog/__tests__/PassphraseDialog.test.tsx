import {fireEvent} from "@testing-library/react";
import {render} from "testUtils";
import {PassphraseDialog} from "../PassphraseDialog";
import {t} from "i18next";

describe("<PassphraseDialog />", () => {
  test("snapshot test", () => {
    const {container} = render(<PassphraseDialog onSubmit={jest.fn()} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should disable submit button if no passphrase has been entered", () => {
    const {getByLabelText} = render(<PassphraseDialog onSubmit={jest.fn()} />);
    const submitButton = getByLabelText(t("PassphraseDialog.submit"));
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });

  test("should not submit if no passphrase has been entered", () => {
    const onSubmit = jest.fn();
    const {getByLabelText} = render(<PassphraseDialog onSubmit={onSubmit} />);
    const submitButton = getByLabelText(t("PassphraseDialog.submit"));
    fireEvent.click(submitButton);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("should submit with correct passphrase if passphrase has been entered", () => {
    const onSubmit = jest.fn();
    const {getByLabelText, getByPlaceholderText} = render(<PassphraseDialog onSubmit={onSubmit} />);
    const submitButton = getByLabelText(t("PassphraseDialog.submit"));
    const passwordInput = getByPlaceholderText(t("PassphraseDialog.inputPlaceholder"));
    fireEvent.change(passwordInput, {target: {value: "Passphrase"}});
    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith("Passphrase");
  });

  test("should toggle the password visibility", () => {
    const {getByDisplayValue, getByLabelText, getByPlaceholderText} = render(<PassphraseDialog onSubmit={jest.fn()} />);
    const passwordInput = getByPlaceholderText(t("PassphraseDialog.inputPlaceholder"));
    fireEvent.change(passwordInput, {target: {value: "Passphrase"}});
    expect(getByDisplayValue("Passphrase")).toHaveProperty("type", "password");
    let toggleButton = getByLabelText(t("PassphraseDialog.showPassword"));
    fireEvent.click(toggleButton);
    expect(getByDisplayValue("Passphrase")).toHaveProperty("type", "text");
  });
});
