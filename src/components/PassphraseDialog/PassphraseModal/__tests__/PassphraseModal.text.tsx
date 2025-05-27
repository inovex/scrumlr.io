import {render} from "testUtils";
import {t} from "i18next";
import {PassphraseModal} from "../PassphraseModal";
import {fireEvent} from "@testing-library/react";
import {useState} from "react";

describe("<PassphraseDialog />", () => {
  test("snapshot test", () => {
    const {container} = render(<PassphraseModal onSubmit={jest.fn()} onClose={jest.fn()} onPassphraseChange={jest.fn()} passphrase={""} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should disable submit button if no passphrase has been entered", () => {
    const {getByLabelText} = render(<PassphraseModal onSubmit={jest.fn()} onClose={jest.fn()} onPassphraseChange={jest.fn()} passphrase={""} />);
    const submitButton = getByLabelText(t("PassphraseModal.submit"));
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });

  test("should enable submit button if passphrase has been entered", () => {
    const {getByLabelText} = render(<PassphraseModal onSubmit={jest.fn()} onClose={jest.fn()} onPassphraseChange={jest.fn()} passphrase={"testPassword"} />);
    const submitButton = getByLabelText(t("PassphraseModal.submit"));
    expect(submitButton).toHaveAttribute("aria-disabled", "false");
  });

  test("should toggle the password visibility", () => {
    const Wrapper = () => {
      const [passphrase, setPassphrase] = useState("");
      return <PassphraseModal passphrase={passphrase} onPassphraseChange={setPassphrase} onSubmit={jest.fn()} onClose={jest.fn()} />;
    };
    const {getByPlaceholderText, getByDisplayValue, getByLabelText} = render(<Wrapper />);
    const passwordInput = getByPlaceholderText(t("PassphraseDialog.inputPlaceholder"));
    fireEvent.change(passwordInput, {target: {value: "Passphrase"}});
    expect(getByDisplayValue("Passphrase")).toHaveProperty("type", "password");
    let toggleButton = getByLabelText(t("PassphraseModal.showPassword"));
    fireEvent.click(toggleButton);
    expect(getByDisplayValue("Passphrase")).toHaveProperty("type", "text");
  });

  test("should submit with correct passphrase if passphrase has been entered", () => {
    const onSubmit = jest.fn();
    const Wrapper = () => {
      const [passphrase, setPassphrase] = useState("");
      return <PassphraseModal passphrase={passphrase} onPassphraseChange={setPassphrase} onSubmit={onSubmit} onClose={jest.fn()} />;
    };
    const {getByPlaceholderText, getByLabelText} = render(<Wrapper />);
    const submitButton = getByLabelText(t("PassphraseDialog.submit"));
    const passwordInput = getByPlaceholderText(t("PassphraseDialog.inputPlaceholder"));
    fireEvent.change(passwordInput, {target: {value: "Passphrase"}});
    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalledWith("Passphrase", "BY_PASSPHRASE");
  });
});
