import {FC} from "react";
import "./AccessPolicySelection.scss";
import {AccessPolicy} from "types/board";
import {generateRandomString} from "utils/random";
import {useTranslation} from "react-i18next";
import {ReactComponent as IconRefresh} from "assets/icon-refresh.svg";
import {ReactComponent as IconClipboard} from "assets/icon-clipboard.svg";
import {TextInputLabel} from "../TextInputLabel";
import {TextInput} from "../TextInput";
import {Button} from "../Button";
import {ValidationError} from "../ValidationError";
import {TextInputAdornment} from "../TextInputAdornment";
import {TextInputAction} from "../TextInputAction";

export interface AccessPolicySelectionProps {
  accessPolicy: AccessPolicy;
  onAccessPolicyChange: (accessPolicy: AccessPolicy) => void;
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
}

export var AccessPolicySelection: FC<AccessPolicySelectionProps> = function ({accessPolicy, onAccessPolicyChange, passphrase, onPassphraseChange}) {
  const {t} = useTranslation();

  const handlePolicyChange = (accessPolicy: AccessPolicy) => {
    if (accessPolicy >= 0 && accessPolicy <= 2) {
      onAccessPolicyChange(accessPolicy);
    }
  };

  let AccessPolicyDescription;
  let AdditionalAccessPolicySettings;
  switch (accessPolicy) {
    case AccessPolicy.Public:
      AccessPolicyDescription = <span>{t("AccessPolicySelection.public")}</span>;
      break;
    case AccessPolicy.ByPassphrase:
      AccessPolicyDescription = <span>{t("AccessPolicySelection.byPassphrase")}</span>;
      AdditionalAccessPolicySettings = (
        <>
          <TextInputLabel label={t("AccessPolicySelection.passphrase")} htmlFor="access-policy-selection__password" />
          <TextInput
            id="access-policy-selection__password"
            data-testid="passphrase-input"
            type="text"
            value={passphrase}
            onChange={(e) => onPassphraseChange(e.target.value)}
            rightAdornment={
              <TextInputAdornment
                data-testid="random-passwort-generator"
                onClick={() => onPassphraseChange(generateRandomString())}
                title={t("AccessPolicySelection.generatePassphrase")}
              >
                <IconRefresh />
              </TextInputAdornment>
            }
            actions={
              <TextInputAction onClick={() => navigator.clipboard.writeText(passphrase)} disabled={!passphrase} title={t("AccessPolicySelection.copyPassphraseToClipboard")}>
                <IconClipboard />
              </TextInputAction>
            }
          />

          {!passphrase && <ValidationError>{t("AccessPolicySelection.passphraseValidationError")}</ValidationError>}
        </>
      );
      break;
    case AccessPolicy.ManualVerification:
      AccessPolicyDescription = <span>{t("AccessPolicySelection.manualVerification")}</span>;
      break;
  }

  return (
    <div className="access-policy-selection">
      <h2 className="access-policy-selection__title">{t("AccessPolicySelection.title")}</h2>

      <div className="access-policy-selection__tabs">
        <Button
          className="access-policy-selection__access-policy"
          variant={accessPolicy === AccessPolicy.Public ? "contained" : "outlined"}
          onClick={() => handlePolicyChange(AccessPolicy.Public)}
        >
          {t("AccessPolicySelection.publicTitle")}
        </Button>
        <Button
          className="access-policy-selection__access-policy"
          variant={accessPolicy === AccessPolicy.ByPassphrase ? "contained" : "outlined"}
          onClick={() => handlePolicyChange(AccessPolicy.ByPassphrase)}
        >
          {t("AccessPolicySelection.byPassphraseTitle")}
        </Button>
        <Button
          className="access-policy-selection__access-policy"
          variant={accessPolicy === AccessPolicy.ManualVerification ? "contained" : "outlined"}
          onClick={() => handlePolicyChange(AccessPolicy.ManualVerification)}
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
