import "./PassphraseModal.scss";
import {t} from "i18next";
import {ReactComponent as HiddenIcon} from "assets/icons/hidden.svg";
import {ReactComponent as VisibleIcon} from "assets/icons/visible.svg";
import {FC, useEffect, useState} from "react";
import {ReactComponent as IconClipboard} from "assets/icons/duplicate.svg";
import {ReactComponent as IconRefresh} from "assets/icons/refresh.svg";
import {ReactComponent as IconClose} from "assets/icons/close.svg";
import {generateRandomString} from "utils/random";
import {TextInputLabel} from "components/TextInputLabel";
import {TextInput} from "components/TextInput";
import {TextInputAdornment} from "components/TextInputAdornment";
import {TextInputAction} from "components/TextInputAction";
import {ValidationError} from "components/ValidationError";
import {Button} from "components/Button";
import {AccessPolicy} from "store/features";

export interface PassphraseModalProps {
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
  onSubmit: (passphrase: string, accessPolicy: AccessPolicy) => void;
  onClose: () => void;
}

export const PassphraseModal: FC<PassphraseModalProps> = ({passphrase, onPassphraseChange, onSubmit, onClose}) => {
  const [visiblePassphrase, setVisiblePassphrase] = useState(false);

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
            placeholder={t("PassphraseDialog.inputPlaceholder")}
            onChange={(e) => onPassphraseChange(e.target.value)}
            rightAdornment={
              <TextInputAdornment
                aria-label={t(`PassphraseDialog${visiblePassphrase ? ".hidePassword" : ".showPassword"}`)}
                title={t("AccessPolicySelection.togglePassphraseVisibility")}
                onClick={() => setVisiblePassphrase(!visiblePassphrase)}
              >
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
            aria-label={t("PassphraseModal.submit")}
            className="new-board__action import-board__action"
            color="primary"
            aria-disabled={passphrase.length <= 0}
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
