import React, {FunctionComponent, useState} from "react";
import "./PassphraseDialog.scss";
import {ScrumlrLogo} from "components/ScrumlrLogo";

export interface PassphraseDialogProps {
  onSubmit: (passphrase: string) => void;
}

export const PassphraseDialog: FunctionComponent<PassphraseDialogProps> = ({onSubmit}) => {
  const [passphrase, setPassphrase] = useState<string>("");
  const [visiblePassphrase, setVisiblePassphrase] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await onSubmit(passphrase);
  };

  const togglePassphraseVisibility = () => {
    setVisiblePassphrase(!visiblePassphrase);
  };

  return (
    <div className="loading-screen">
      <ScrumlrLogo className="passphrase-dialog__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
      <div className="passphrase-dialog">
        <form className="passphrase-dialog__form">
          <label htmlFor="passphrase" className="passphrase-dialog__input-label">
            Enter the passphrase to access this board
          </label>
          <input id="passphrase" type={visiblePassphrase ? "text" : "password"} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />

          <button type="button" aria-label="Toggle passphrase visibility" aria-pressed={visiblePassphrase} onClick={togglePassphraseVisibility}>
            Toggle passphrase visibility
          </button>
          <button type="submit" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </div>

      <span className="passphrase-dialog__hint">Collaborative session. By continuing you're accepting our privacy policy.</span>
    </div>
  );
};

export default PassphraseDialog;
