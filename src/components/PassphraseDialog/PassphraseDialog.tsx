import {FC, useState} from "react";
import "./PassphraseDialog.scss";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {TextInputLabel} from "../TextInputLabel";
import {TextInput} from "../TextInput";
import {Button} from "../Button";

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
    <div className="passphrase-dialog__wrapper">
      <div className="passphrase-dialog">
        <Link to="/">
          <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
        </Link>

        <form className="passphrase-dialog__form" onSubmit={handleSubmit}>
          <TextInputLabel label={t("PassphraseDialog.passphraseInputLabel")}>
            <TextInput type={visiblePassphrase ? "text" : "password"} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
          </TextInputLabel>

          {3 > 5 && (
            <button type="button" aria-label="Toggle passphrase visibility" aria-pressed={visiblePassphrase} onClick={togglePassphraseVisibility}>
              {t("PassphraseDialog.togglePassphraseVisibility")}
            </button>
          )}

          <Button type="submit" color="primary" className="passphrase-dialog__submit-button" disabled={!passphrase}>
            {t("PassphraseDialog.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PassphraseDialog;
