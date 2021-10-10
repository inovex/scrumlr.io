import {FunctionComponent, useState} from "react";
import "./PassphraseDialog.scss";

export interface PassphraseDialogProps {
  manualVerificationAvailable?: boolean;
}

export const PassphraseDialog: FunctionComponent<PassphraseDialogProps> = ({manualVerificationAvailable = false}) => {
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    setError("Incorrect passphrase");
  };

  return (
    <div className="loading-screen">
      <div>Logo</div>
      <div className="passphrase-dialog">
        <div className="passphrase-dialog__form">
          <label htmlFor="passphrase" className="passphrase-dialog__input-label">
            Enter the passphrase to access this board
          </label>
          <input id="passphrase" type="password" aria-invalid={Boolean(error)} aria-describedby={error ? "passphrase-error" : undefined} />
          <button onClick={handleSubmit}>Submit</button>

          {error && (
            <span id="passphrase-error" className="passphrase-dialog__error">
              {error}
            </span>
          )}
        </div>

        {manualVerificationAvailable && <span>Wait for admin approval</span>}
      </div>
      <span>Collaborative session. By continuing you're accepting our privacy policy.</span>
    </div>
  );
};

export default PassphraseDialog;
