import "./PassphraseModal.scss";
import {t} from "i18next";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as VisibleIcon} from "assets/icon-visible.svg";
import {FC, useState} from "react";
import {ReactComponent as IconClipboard} from "assets/icon-clipboard.svg";
import {ReactComponent as IconRefresh} from "assets/icon-refresh.svg";
import {TextInputLabel} from "../../TextInputLabel";
import {TextInput} from "../../TextInput";
import {TextInputAdornment} from "../../TextInputAdornment";
import {TextInputAction} from "../../TextInputAction";
import {ValidationError} from "../../ValidationError";
import {generateRandomString} from "../../../utils/random";

export interface PassphraseModalProps {
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
}

export const PassphraseModal: FC<PassphraseModalProps> = ({passphrase, onPassphraseChange}) => {
  const [visiblePassphrase, setVisiblePassphrase] = useState(true);

  return (
    <div className="password-modal">
      <div className="password-modal__container">
        <TextInputLabel label={t("AccessPolicySelection.passphrase")} htmlFor="access-policy-selection__password" />
        <p>Das exportierte Board ist passwortgeschützt. Bitte geben Sie ein neues Passwort ein oder fahren Sie mit einem nicht passwortgeschützten Board fort.</p>

        <TextInput
          id="access-policy-selection__password"
          data-testid="passphrase-input"
          type={visiblePassphrase ? "text" : "password"}
          value={passphrase}
          onChange={(e) => onPassphraseChange(e.target.value)}
          rightAdornment={
            <TextInputAdornment title={t("AccessPolicySelection.togglePassphraseVisibility")} onClick={() => setVisiblePassphrase(!visiblePassphrase)}>
              {visiblePassphrase && <VisibleIcon />}
              {!visiblePassphrase && <HiddenIcon />}
            </TextInputAdornment>
          }
          actions={
            <>
              <TextInputAction
                data-testid="random-passwort-generator"
                onClick={() => onPassphraseChange(generateRandomString())}
                title={t("AccessPolicySelection.generatePassphrase")}
              >
                <IconRefresh />
              </TextInputAction>
              <TextInputAction onClick={() => navigator.clipboard.writeText(passphrase)} disabled={!passphrase} title={t("AccessPolicySelection.copyPassphraseToClipboard")}>
                <IconClipboard />
              </TextInputAction>
            </>
          }
        />

        {!passphrase && <ValidationError>{t("AccessPolicySelection.passphraseValidationError")}</ValidationError>}
      </div>
    </div>
  );
};
