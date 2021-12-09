import {FC, useState} from "react";
import "./PassphraseDialog.scss";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {ReactComponent as VisibleIcon} from "assets/icon-visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {TextInputLabel} from "../TextInputLabel";
import {TextInput} from "../TextInput";
import {Button} from "../Button";
import {TextInputAdornment} from "../TextInputAdornment";

export interface PassphraseDialogProps {
  onSubmit: (passphrase: string) => void;
}

export const PassphraseDialog: FC<PassphraseDialogProps> = ({onSubmit}) => {
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
          <TextInputLabel label={t("PassphraseDialog.passphraseInputLabel")} htmlFor="password-dialog__password" />
          <TextInput
            id="password-dialog__password"
            type={visiblePassphrase ? "text" : "password"}
            rightAdornment={
              <TextInputAdornment title={t("PassphraseDialog.togglePassphraseVisibility")} onClick={togglePassphraseVisibility}>
                {visiblePassphrase && <VisibleIcon />}
                {!visiblePassphrase && <HiddenIcon />}
              </TextInputAdornment>
            }
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />

          <Button type="submit" color="primary" className="passphrase-dialog__submit-button" disabled={!passphrase}>
            {t("PassphraseDialog.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PassphraseDialog;
