import {FC} from "react";
import {Participant} from "types/participant";
import {AvataaarProps} from "components/Avatar";
import {Votes} from "components/Votes";
import {NoteReactionList} from "components/Note/NoteReactionList/NoteReactionList";
import "./NoteDialogNoteFooter.scss";

type NoteDialogNoteFooterProps = {
  showAuthors: boolean;
  authorId: string;
  avatar?: AvataaarProps;
  authorName: string;
  noteId: string;
  viewer: Participant;
  colorClassName?: string;
};

export const NoteDialogNoteFooter: FC<NoteDialogNoteFooterProps> = (props: NoteDialogNoteFooterProps) => (
  <div className="note-dialog__note-footer">
    <NoteReactionList noteId={props.noteId} colorClassName={props.colorClassName} />
    <Votes {...props} className="note-dialog__note-votes" />
  </div>
);
