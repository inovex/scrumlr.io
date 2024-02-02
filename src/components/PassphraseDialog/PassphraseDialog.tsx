import {ChangeEvent, FC, FormEvent, MouseEvent, useState} from "react";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as KeyIcon} from "assets/icon-key.svg";
import {ReactComponent as VisibleIcon} from "assets/icon-visible.svg";
import {Background} from "components/Background";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./PassphraseDialog.scss";

import {ReactComponent as ArrowRightIcon} from "assets/icon-arrow-right.svg";
import {useTranslation} from "react-i18next";

export interface PassphraseDialogProps {
  onSubmit: (passphrase: string) => void;
}

export const PassphraseDialog: FC<PassphraseDialogProps> = ({onSubmit}: PassphraseDialogProps) => {
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
    if (passphrase.length === 0) {
      e.preventDefault();
      return;
    }
    onSubmit(passphrase);
  };

  return (
    <Background>
      <div className="passphrase-dialog">
        <a className="passphrase-dialog__logo" href="/" aria-label="Homepage">
          <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
        </a>

        <form className="passphrase-dialog__form" onSubmit={submitPassphraseForm}>
          <KeyIcon className="form__icon" />
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
                {passwordVisible ? <HiddenIcon /> : <VisibleIcon />}
              </button>
            </div>
            <button aria-disabled={passphrase.length === 0} aria-label={t("PassphraseDialog.submit")} className="form__submit-button" type="submit">
              <ArrowRightIcon />
            </button>
          </div>
        </form>
      </div>
    </Background>
  );
};

export default PassphraseDialog;
