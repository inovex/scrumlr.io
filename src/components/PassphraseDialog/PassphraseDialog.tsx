import {ChangeEvent, FC, FormEvent, MouseEvent, useState} from "react";
import {Hidden, KeyProtected, Visible, ArrowRight} from "components/Icon";
import {Background} from "components/Background";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./PassphraseDialog.scss";

import {useTranslation} from "react-i18next";

export interface PassphraseDialogProps {
  onSubmit: (passphrase: string) => void;
  incorrectPassphrase: boolean;
}

export const PassphraseDialog: FC<PassphraseDialogProps> = ({onSubmit, incorrectPassphrase}: PassphraseDialogProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const {t} = useTranslation();

  const togglePasswordVisibility = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setPasswordVisible((currentValue) => !currentValue);
  };

  const changePassphrase = (e: ChangeEvent<HTMLInputElement>) => {
    setPassphrase(e.target.value);
  };

  const submitPassphraseForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passphrase.length === 0) {
      return;
    }
    onSubmit(passphrase);
  };

  return (
    <Background>
      <div className="passphrase-dialog">
        <a className="passphrase-dialog__logo" href="/" aria-label="Homepage">
          <ScrumlrLogo />
        </a>

        <form className="passphrase-dialog__form" onSubmit={submitPassphraseForm}>
          <KeyProtected className="form__icon" />
          <label className="form__label">{t("PassphraseDialog.label")}</label>

          <div className="form__input-row">
            <div className="form__password-input">
              <input
                className="password-input__input"
                type={passwordVisible ? "text" : "password"}
                onChange={changePassphrase}
                value={passphrase}
                placeholder={t("PassphraseDialog.inputPlaceholder")}
              />
              <button
                aria-label={t(`PassphraseDialog${passwordVisible ? ".hidePassword" : ".showPassword"}`)}
                className="password-input__toggle"
                onClick={togglePasswordVisibility}
                type="button"
              >
                {passwordVisible ? <Hidden /> : <Visible />}
              </button>
            </div>
            <button aria-disabled={passphrase.length === 0} aria-label={t("PassphraseDialog.submit")} className="form__submit-button" type="submit">
              <ArrowRight />
            </button>
          </div>
          {incorrectPassphrase && <p className="form__error-message">{t("PassphraseDialog.incorrectPassphrase")}</p>}
        </form>
      </div>
    </Background>
  );
};

export default PassphraseDialog;
