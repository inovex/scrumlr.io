import classNames from "classnames";
import {FC} from "react";
import "./NoteDialogNoteWrapper.scss";

type NoteDialogNoteWrapperProps = {};

export const NoteDialogNoteWrapper: FC<NoteDialogNoteWrapperProps> = ({children}) => (
    <div className={classNames("note-dialog__scrollbar")}>
      <div className={classNames("note-dialog__note-wrapper")}>{children}</div>
    </div>
  );
