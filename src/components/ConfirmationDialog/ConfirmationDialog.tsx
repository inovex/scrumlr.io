import {Button} from "components/Button";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {Link} from "react-router-dom";
import "./ConfirmationDialog.scss";

export interface ConfirmationDialogProps {
  headline: string;
  acceptMessage: string;
  declineMessage: string;
  linkTo: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConfirmationDialog = ({headline, acceptMessage, onAccept, declineMessage, onDecline, linkTo}: ConfirmationDialogProps) => (
    <div className="confirmation-dialog__wrapper">
      <div className="confirmation-dialog">
        <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
        <h2>{headline}</h2>
        <Link to={linkTo} className="confirmation-dialog__link">
          <Button type="submit" color="primary" className="confirmation-dialog__button" onClick={() => onAccept()}>
            {acceptMessage}
          </Button>
        </Link>
        <Button type="submit" color="primary" className="confirmation-dialog__button" variant="outlined" onClick={() => onDecline()}>
          {declineMessage}
        </Button>
      </div>
    </div>
  );

export default ConfirmationDialog;
