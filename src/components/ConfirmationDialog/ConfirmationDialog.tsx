import {FC} from "react";
import classNames from "classnames";
import {Portal} from "../Portal";
import "./ConfirmationDialog.scss";

export interface ConfirmationDialogProps {
  className?: string;
  onClose: () => void;
}

export const ConfirmationDialog: FC<ConfirmationDialogProps> = (props) => (
  <Portal onClose={() => props.onClose()} className={classNames("confirmation-dialog__wrapper", props.className)}>
    <aside className="confirmation-dialog">{props.children}</aside>
  </Portal>
);

export default ConfirmationDialog;
