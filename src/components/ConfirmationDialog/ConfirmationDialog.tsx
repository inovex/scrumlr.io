import {Button} from "components/Button";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./ConfirmationDialog.scss";
import {Portal} from "../Portal";

export interface ConfirmationDialogProps {
  headline: string;
  acceptMessage: string;
  declineMessage: string;
  onAccept: () => void;
  onDecline: () => void;
  className?: string;
}

export const ConfirmationDialog = ({headline, acceptMessage, onAccept, declineMessage, onDecline, className}: ConfirmationDialogProps) => (
  <Portal onClose={() => onDecline()} className="confirmation-dialog__wrapper">
    <aside className="confirmation-dialog">
      <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
      <h2>{headline}</h2>
      <div>
        <Button type="submit" color="primary" onClick={() => onAccept()}>
          {acceptMessage}
        </Button>
        <Button type="submit" color="primary" variant="outlined" onClick={() => onDecline()} autoFocus>
          {declineMessage}
        </Button>
      </div>
    </aside>
  </Portal>
);

export default ConfirmationDialog;
