import {FC, useState} from "react";
import "./PassphraseDialog.scss";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {useTranslation} from "react-i18next";

export interface PassphraseDialogProps {
  onSubmit: (passphrase: string) => void;
}

export var PassphraseDialog: FC<PassphraseDialogProps> = function ({onSubmit}) {
  const {t} = useTranslation();

  const [passphrase, setPassphrase] = useState<string>("");
  const [visiblePassphrase, setVisiblePassphrase] = useState(false);

  const handleSubmit = async () => {
    await onSubmit(passphrase);
  };

  const togglePassphraseVisibility = () => {
    setVisiblePassphrase(!visiblePassphrase);
  };

  return (
    <div className="loading-screen">
      <ScrumlrLogo className="passphrase-dialog__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
      <div className="passphrase-dialog" onSubmit={handleSubmit}>
        <form className="passphrase-dialog__form">
          <label htmlFor="passphrase" className="passphrase-dialog__input-label">
            {t("PassphraseDialog.passphraseInputLabel")}
          </label>
          <input id="passphrase" type={visiblePassphrase ? "text" : "password"} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />

          <button type="button" aria-label="Toggle passphrase visibility" aria-pressed={visiblePassphrase} onClick={togglePassphraseVisibility}>
            {t("PassphraseDialog.togglePassphraseVisibility")}
          </button>
          <button type="submit" className="passphrase-dialog__submit-button" disabled={!passphrase}>
            {t("PassphraseDialog.submit")}
          </button>
        </form>
      </div>

      <span className="passphrase-dialog__hint">{t("PassphraseDialog.hint")}</span>
    </div>
  );
};

export default PassphraseDialog;
