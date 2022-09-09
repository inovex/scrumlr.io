import classNames from "classnames";
import {Button} from "components/Button";
import {Portal} from "components/Portal";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./ConfirmationDialog.scss";

export interface ConfirmationDialogProps {
  headline: string;
  acceptMessage: string;
  declineMessage: string;
  onAccept: () => void;
  onDecline: () => void;
  className?: string;
}

export const ConfirmationDialog = ({headline, acceptMessage, onAccept, declineMessage, onDecline, className}: ConfirmationDialogProps) => (
  <Portal>
    <div className={classNames("confirmation-dialog__wrapper", className)}>
      <div className="confirmation-dialog">
        <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
        <h2>{headline}</h2>
        <Button type="submit" color="primary" className="confirmation-dialog__button" onClick={() => onAccept()}>
          {acceptMessage}
        </Button>
        <Button type="submit" color="primary" className="confirmation-dialog__button" variant="outlined" onClick={() => onDecline()} autoFocus>
          {declineMessage}
        </Button>
      </div>
    </div>
  </Portal>
);

export default ConfirmationDialog;
