import {FC, useState} from "react";
import "./AccessPolicySelection.scss";
import {AccessPolicy} from "store/features/board/types";
import {generateRandomString} from "utils/random";
import {useTranslation} from "react-i18next";
import {Visible, Hidden, Duplicate, Refresh} from "components/Icon";
import {TextInputAdornment} from "components/TextInputAdornment";
import {TextInputLabel} from "../TextInputLabel";
import {TextInput} from "../TextInput";
import {Button} from "../Button";
import {ValidationError} from "../ValidationError";
import {TextInputAction} from "../TextInputAction";

export interface AccessPolicySelectionProps {
  accessPolicy: AccessPolicy;
  onAccessPolicyChange: (accessPolicy: AccessPolicy) => void;
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
}

export const AccessPolicySelection: FC<AccessPolicySelectionProps> = ({accessPolicy, onAccessPolicyChange, passphrase, onPassphraseChange}) => {
  const {t} = useTranslation();
  const [visiblePassphrase, setVisiblePassphrase] = useState(true);

  let AccessPolicyDescription;
  let AdditionalAccessPolicySettings;
  switch (accessPolicy) {
    case "BY_PASSPHRASE":
      AccessPolicyDescription = <span>{t("AccessPolicySelection.byPassphrase")}</span>;
      AdditionalAccessPolicySettings = (
        <>
          <TextInputLabel label={t("AccessPolicySelection.passphrase")} htmlFor="access-policy-selection__password" />
          <TextInput
            id="access-policy-selection__password"
            data-testid="passphrase-input"
            type={visiblePassphrase ? "text" : "password"}
            value={passphrase}
            onChange={(e) => onPassphraseChange(e.target.value)}
            rightAdornment={
              <TextInputAdornment title={t("AccessPolicySelection.togglePassphraseVisibility")} onClick={() => setVisiblePassphrase(!visiblePassphrase)}>
                {visiblePassphrase && <Visible />}
                {!visiblePassphrase && <Hidden />}
              </TextInputAdornment>
            }
            actions={
              <>
                <TextInputAction
                  data-testid="random-passwort-generator"
                  onClick={() => onPassphraseChange(generateRandomString())}
                  title={t("AccessPolicySelection.generatePassphrase")}
                >
                  <Refresh />
                </TextInputAction>
                <TextInputAction onClick={() => navigator.clipboard.writeText(passphrase)} disabled={!passphrase} title={t("AccessPolicySelection.copyPassphraseToClipboard")}>
                  <Duplicate />
                </TextInputAction>
              </>
            }
          />

          {!passphrase && <ValidationError>{t("AccessPolicySelection.passphraseValidationError")}</ValidationError>}
        </>
      );
      break;
    case "BY_INVITE":
      AccessPolicyDescription = <span>{t("AccessPolicySelection.manualVerification")}</span>;
      break;
    case "PUBLIC":
    default:
      AccessPolicyDescription = <span>{t("AccessPolicySelection.public")}</span>;
      break;
  }

  return (
    <div className="access-policy-selection">
      <h2 className="access-policy-selection__title">{t("AccessPolicySelection.title")}</h2>

      <div className="access-policy-selection__tabs">
        <Button className="access-policy-selection__access-policy" variant={accessPolicy === "PUBLIC" ? "contained" : "outlined"} onClick={() => onAccessPolicyChange("PUBLIC")}>
          {t("AccessPolicySelection.publicTitle")}
        </Button>
        <Button
          className="access-policy-selection__access-policy"
          variant={accessPolicy === "BY_PASSPHRASE" ? "contained" : "outlined"}
          onClick={() => onAccessPolicyChange("BY_PASSPHRASE")}
        >
          {t("AccessPolicySelection.byPassphraseTitle")}
        </Button>
        <Button
          className="access-policy-selection__access-policy"
          variant={accessPolicy === "BY_INVITE" ? "contained" : "outlined"}
          onClick={() => onAccessPolicyChange("BY_INVITE")}
        >
          {t("AccessPolicySelection.manualVerificationTitle")}
        </Button>
      </div>

      <div className="access-policy__details">
        {AccessPolicyDescription}
        {AdditionalAccessPolicySettings && <div className="access-policy-selection__additional-settings">{AdditionalAccessPolicySettings}</div>}
      </div>
    </div>
  );
};
