import {ChangeEvent, FC} from "react";
import "./AccessPolicySelection.scss";
import {AccessPolicy} from "types/board";
import {generateRandomString} from "utils/random";
import {useTranslation} from "react-i18next";

export interface AccessPolicySelectionProps {
  accessPolicy: AccessPolicy;
  onAccessPolicyChange: (accessPolicy: AccessPolicy) => void;
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
}

export const AccessPolicySelection: FC<AccessPolicySelectionProps> = ({accessPolicy, onAccessPolicyChange, passphrase, onPassphraseChange}) => {
  const {t} = useTranslation();

  const handlePolicyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const accessPolicy = Number.parseInt(e.target.value);

    if (accessPolicy >= 0 && accessPolicy <= 2) {
      onAccessPolicyChange(accessPolicy);
    }
  };

  let AccessPolicyDescription;
  let AdditionalAccessPolicySettings;
  switch (accessPolicy) {
    case AccessPolicy.Public:
      AccessPolicyDescription = <div>{t("AccessPolicySelection.public")}</div>;
      break;
    case AccessPolicy.ByPassphrase:
      AccessPolicyDescription = <div>{t("AccessPolicySelection.byPassphrase")}</div>;
      AdditionalAccessPolicySettings = (
        <>
          <label>
            <div>{t("AccessPolicySelection.passphrase")}</div>
            <input data-testid="passphrase-input" type="text" value={passphrase} onChange={(e) => onPassphraseChange(e.target.value)} />
          </label>
          <button data-testid="random-passwort-generator" onClick={() => onPassphraseChange(generateRandomString())}>
            {t("AccessPolicySelection.generatePassphrase")}
          </button>
          <button onClick={() => navigator.clipboard.writeText(passphrase)} disabled={!passphrase}>
            {t("AccessPolicySelection.copyPassphraseToClipboard")}
          </button>
          {!passphrase && <div>{t("AccessPolicySelection.passphraseValidationError")}</div>}
        </>
      );
      break;
    case AccessPolicy.ManualVerification:
      AccessPolicyDescription = <div>{t("AccessPolicySelection.manualVerification")}</div>;
      break;
  }

  return (
    <div className="access-policy-selection">
      <label>
        <div>{t("AccessPolicySelection.title")}</div>
        <input type="range" min={0} max={3} step={1} value={accessPolicy} onChange={handlePolicyChange} />
      </label>
      {AccessPolicyDescription}

      {AdditionalAccessPolicySettings && <div className="access-policy-selection__additional-settings">{AdditionalAccessPolicySettings}</div>}
    </div>
  );
};
