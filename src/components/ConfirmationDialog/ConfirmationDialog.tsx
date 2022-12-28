import React from "react";
import {Button} from "components/Button";
import {Portal} from "components/Portal";
import "./ConfirmationDialog.scss";

type ConfirmationDialogProps = {
  title: string;
  icon?: React.FC;
  onAccept: () => void;
  onDecline: () => void;
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = (props) => (
    <Portal onClose={props.onDecline}>
      <div className="confirmation-dialog__background" />
      <div className="confirmation-dialog__wrapper">
        <aside className="confirmation-dialog">
          <h2 className="confirmation-dialog__title">{props.title}</h2>
          <div className="confirmation-dialog__buttons">
            <Button type="submit" color="secondary" className="confirmation-dialog__button" onClick={() => props.onAccept()}>
              Yes
            </Button>
            <Button type="submit" color="secondary" className="confirmation-dialog__button" variant="outlined" onClick={() => props.onDecline()} autoFocus>
              No
            </Button>
          </div>
        </aside>
      </div>
    </Portal>
  );

export default ConfirmationDialog;
