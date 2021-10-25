import {ChangeEvent, FC} from "react";
import "./AccessPolicySelection.scss";
import {AccessPolicy} from "types/board";

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
            <span>Passphrase</span>
            <input type="text" value={passphrase} onChange={(e) => onPassphraseChange(e.target.value)} />
          </label>
          {!passphrase && <span>A passphrase must be set</span>}
        </>
      );
      break;
    case AccessPolicy.ManualVerification:
      AccessPolicyDescription = <div>Admins of board can to manually verify or reject each access request individually.</div>;
      break;
  }

  return (
    <div className="access-policy-selection">
      <label>
        <span>Access Policy</span>
        <input type="range" min={0} max={3} step={1} value={accessPolicy} onChange={handlePolicyChange} />
      </label>
      {AccessPolicyDescription}

      {AdditionalAccessPolicySettings && <div className="access-policy-selection__additional-settings">{AdditionalAccessPolicySettings}</div>}
    </div>
  );
};
