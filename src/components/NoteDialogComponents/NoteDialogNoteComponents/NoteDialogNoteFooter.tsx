import {FC} from "react";
import {NoteReactionList} from "components/Note/NoteReactionList/NoteReactionList";
import "./NoteDialogNoteFooter.scss";

type NoteDialogNoteFooterProps = {
  noteId: string;
  colorClassName?: string;
};

export const NoteDialogNoteFooter: FC<NoteDialogNoteFooterProps> = (props: NoteDialogNoteFooterProps) => (
  <div className="note-dialog__note-footer">
    <NoteReactionList noteId={props.noteId} colorClassName={props.colorClassName} />
  </div>
);
