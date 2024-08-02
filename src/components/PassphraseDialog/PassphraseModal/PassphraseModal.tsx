import "./PassphraseModal.scss";
import {t} from "i18next";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as VisibleIcon} from "assets/icon-visible.svg";
import {FC, useState} from "react";
import {ReactComponent as IconClipboard} from "assets/icon-clipboard.svg";
import {ReactComponent as IconRefresh} from "assets/icon-refresh.svg";
import {ReactComponent as IconClose} from "assets/icon-close.svg";
import {TextInputLabel} from "../../TextInputLabel";
import {TextInput} from "../../TextInput";
import {TextInputAdornment} from "../../TextInputAdornment";
import {TextInputAction} from "../../TextInputAction";
import {ValidationError} from "../../ValidationError";
import {generateRandomString} from "../../../utils/random";
import {Button} from "../../Button";
import {AccessPolicy} from "../../../types/board";

export interface PassphraseModalProps {
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
  onSubmit: (passphrase: string, accessPolicy: AccessPolicy) => void;
}

export const PassphraseModal: FC<PassphraseModalProps> = ({passphrase, onPassphraseChange, onSubmit}) => {
  const [visiblePassphrase, setVisiblePassphrase] = useState(true);

  return (
    <div className="password-modal">
      <div className="password-modal__container">
        <div className="password-modal__header">
          <TextInputLabel label={t("AccessPolicySelection.passphrase")} htmlFor="access-policy-selection__password" />
          <IconClose className="password-modal__close" />
        </div>
        <p>Das exportierte Board ist passwortgeschützt. Bitte geben Sie ein neues Passwort ein oder fahren Sie mit einem nicht passwortgeschützten Board fort.</p>
        <div>
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
        <div className="new-board__actions import-board__action">
          <Button
            className="new-board__action import-board__action"
            color="primary"
            disabled={passphrase.length <= 0}
            onClick={() => onSubmit(passphrase, AccessPolicy.BY_PASSPHRASE)}
          >
            Set new password
          </Button>

          <Button
            className="new-board__action import-board__action"
            color="primary"
            onClick={() => onSubmit("", AccessPolicy.PUBLIC)} // Call onSubmit with an empty string to continue without a password
          >
            Continue with public board
          </Button>
        </div>
      </div>
    </div>
  );
};
