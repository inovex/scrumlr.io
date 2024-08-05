import "./PassphraseModal.scss";
import {t} from "i18next";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as VisibleIcon} from "assets/icon-visible.svg";
import {FC, useEffect, useState} from "react";
import {ReactComponent as IconClipboard} from "assets/icon-clipboard.svg";
import {ReactComponent as IconRefresh} from "assets/icon-refresh.svg";
import {ReactComponent as IconClose} from "assets/icon-close.svg";
import {generateRandomString} from "utils/random";
import {AccessPolicy} from "types/board";
import {TextInputLabel} from "../../TextInputLabel";
import {TextInput} from "../../TextInput";
import {TextInputAdornment} from "../../TextInputAdornment";
import {TextInputAction} from "../../TextInputAction";
import {ValidationError} from "../../ValidationError";
import {Button} from "../../Button";

export interface PassphraseModalProps {
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
  onSubmit: (passphrase: string, accessPolicy: AccessPolicy) => void;
  onClose: () => void;
}

export const PassphraseModal: FC<PassphraseModalProps> = ({passphrase, onPassphraseChange, onSubmit, onClose}) => {
  const [visiblePassphrase, setVisiblePassphrase] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="password-modal">
      <div className="password-modal__container">
        <div className="password-modal__header">
          <TextInputLabel label={t("AccessPolicySelection.passphrase")} htmlFor="access-policy-selection__password" />
          <IconClose onClick={onClose} className="password-modal__close" />
        </div>
        <p>{t("PassphraseModal.info")}</p>
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
            {t("PassphraseModal.newPassword")}
          </Button>

          <Button
            className="new-board__action import-board__action"
            color="primary"
            onClick={() => onSubmit("", AccessPolicy.PUBLIC)} // Call onSubmit with an empty string to continue without a password
          >
            {t("PassphraseModal.continuePublic")}
          </Button>
        </div>
      </div>
    </div>
  );
};
