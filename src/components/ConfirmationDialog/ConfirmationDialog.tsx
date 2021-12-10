import {Button} from "components/Button";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./ConfirmationDialog.scss";

export interface ConfirmationDialogProps {
  headline: string;
  acceptMessage: string;
  declineMessage: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConfirmationDialog = ({headline, acceptMessage, onAccept, declineMessage, onDecline}: ConfirmationDialogProps) => (
  <div className="confirmation-dialog__wrapper">
    <div className="confirmation-dialog">
      <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
      <h2>{headline}</h2>
      <Button type="submit" color="primary" className="confirmation-dialog__button" onClick={() => onAccept()}>
        {acceptMessage}
      </Button>
      <Button type="submit" color="primary" className="confirmation-dialog__button" variant="outlined" onClick={() => onDecline()}>
        {declineMessage}
      </Button>
    </div>
  </div>
);

export default ConfirmationDialog;
