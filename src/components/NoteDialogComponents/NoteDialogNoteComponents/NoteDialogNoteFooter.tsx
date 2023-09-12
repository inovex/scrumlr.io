import {FC} from "react";
import {NoteReactionList} from "components/Note/NoteReactionList/NoteReactionList";
import classNames from "classnames";
import "./NoteDialogNoteFooter.scss";

type NoteDialogNoteFooterProps = {
  noteId: string;
  colorClassName?: string;
  showNoteReactions: boolean;
};

export const NoteDialogNoteFooter: FC<NoteDialogNoteFooterProps> = (props: NoteDialogNoteFooterProps) => (
  <div className={classNames("note-dialog__note-footer", {"note-dialog__note-footer--collapsed": !props.showNoteReactions})}>
    <NoteReactionList noteId={props.noteId} colorClassName={props.colorClassName} show={props.showNoteReactions} />
  </div>
);
