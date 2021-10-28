import {ChangeEvent, FC} from "react";
import "./AccessPolicySelection.scss";
import {AccessPolicy} from "types/board";
import {generateRandomString} from "utils/random";

export interface AccessPolicySelectionProps {
  accessPolicy: AccessPolicy;
  onAccessPolicyChange: (accessPolicy: AccessPolicy) => void;
  passphrase: string;
  onPassphraseChange: (passphrase: string) => void;
}

export const AccessPolicySelection: FC<AccessPolicySelectionProps> = ({accessPolicy, onAccessPolicyChange, passphrase, onPassphraseChange}) => {
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
      AccessPolicyDescription = <div>Access by URL without further verification.</div>;
      break;
    case AccessPolicy.ByPassphrase:
      AccessPolicyDescription = <div>Access by URL and passphrase.</div>;
      AdditionalAccessPolicySettings = (
        <>
          <label>
            <div>Passphrase</div>
            <input data-testid="passphrase-input" type="text" value={passphrase} onChange={(e) => onPassphraseChange(e.target.value)} />
          </label>
          <button data-testid="random-passwort-generator" onClick={() => onPassphraseChange(generateRandomString())}>
            Generate random passphrase
          </button>
          <button onClick={() => navigator.clipboard.writeText(passphrase)} disabled={!passphrase}>
            Copy passphrase to clipboard
          </button>
          {!passphrase && <div>A passphrase must be set</div>}
        </>
      );
      break;
    case AccessPolicy.ManualVerification:
      AccessPolicyDescription = <div>Admins of board can manually verify or reject each access request individually.</div>;
      break;
  }

  return (
    <div className="access-policy-selection">
      <label>
        <div>Access Policy</div>
        <input type="range" min={0} max={3} step={1} value={accessPolicy} onChange={handlePolicyChange} />
      </label>
      {AccessPolicyDescription}

      {AdditionalAccessPolicySettings && <div className="access-policy-selection__additional-settings">{AdditionalAccessPolicySettings}</div>}
    </div>
  );
};
