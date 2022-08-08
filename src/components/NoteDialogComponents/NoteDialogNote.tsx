import classNames from "classnames";
import {FC} from "react";
import {AvataaarProps} from "components/Avatar";
import {Participant} from "types/participant";
import {NoteDialogNoteComponents} from "./NoteDialogNoteComponents";
import "./NoteDialogNote.scss";

export type NoteDialogNoteProps = {
  noteId: string;
  text: string;
  authorId: string;
  avatar?: AvataaarProps;
  authorName: string;
  showAuthors: boolean;
  onClose: () => void;
  onDeleteOfParent: () => void;
  showUnstackButton: boolean;
  className?: string;

  viewer: Participant;
};

export const NoteDialogNote: FC<NoteDialogNoteProps> = (props: NoteDialogNoteProps) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": props.viewer.user.id === props.authorId}, props.className)} onClick={(e) => e.stopPropagation()}>
    <NoteDialogNoteComponents.Content {...props} />
    <NoteDialogNoteComponents.Footer {...props} />
    <NoteDialogNoteComponents.Options {...props} />
  </div>
);
