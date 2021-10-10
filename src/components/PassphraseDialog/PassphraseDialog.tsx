import React, {FunctionComponent, useState} from "react";
import "./PassphraseDialog.scss";

export interface PassphraseDialogProps {
  manualVerificationAvailable?: boolean;
  onPassphrase: (passphrase: string) => Promise<boolean>;
}

export const PassphraseDialog: FunctionComponent<PassphraseDialogProps> = ({onPassphrase, manualVerificationAvailable = false}) => {
  const [error, setError] = useState<string>();
  const [passphrase, setPassphrase] = useState<string>("");
  const [visiblePassphrase, setVisiblePassphrase] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const validPassphrase = await onPassphrase(passphrase);
    if (!validPassphrase) {
      setError("Incorrect passphrase");
    }
  };

  const togglePassphraseVisibility = () => {
    setVisiblePassphrase(!visiblePassphrase);
  };

  return (
    <div className="loading-screen">
      <div>Logo</div>
      <div className="passphrase-dialog">
        <form className="passphrase-dialog__form">
          <label htmlFor="passphrase" className="passphrase-dialog__input-label">
            Enter the passphrase to access this board
          </label>
          <input
            id="passphrase"
            type={visiblePassphrase ? "text" : "password"}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "passphrase-error" : undefined}
          />

          <button type="button" aria-label="Toggle passphrase visibility" aria-pressed={visiblePassphrase} onClick={togglePassphraseVisibility}>
            Toggle passphrase visibility
          </button>
          <button type="submit" onClick={handleSubmit}>
            Submit
          </button>

          {error && (
            <span id="passphrase-error" className="passphrase-dialog__error">
              {error}
            </span>
          )}
        </form>

        {manualVerificationAvailable && <span className="passphrase-dialog__manual-verification">Wait for admin approval</span>}
      </div>
      <span>Collaborative session. By continuing you're accepting our privacy policy.</span>
    </div>
  );
};

export default PassphraseDialog;
