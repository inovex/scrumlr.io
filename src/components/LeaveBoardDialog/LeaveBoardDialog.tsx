import {Portal} from "components/Portal";
import React from "react";

type LeaveBoardDialogProps = {
  onClose: () => void;
};

export const LeaveBoardDialog: React.FC<LeaveBoardDialogProps> = (props) => (
    <Portal>
      <div className="dialog-bg" onClick={props.onClose} />
      <aside className="leave-board-dialog">
        <h2>Are you sure that you want to leave the session and return to the homepage?</h2>
        <div>
          <button>Yes</button>
          <button onClick={props.onClose}>No</button>
        </div>
      </aside>
    </Portal>
  );
