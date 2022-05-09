import classNames from "classnames";
import {FC} from "react";
import {AvataaarProps} from "components/Avatar";
import {NoteDialogNoteComponents} from "./NoteDialogNoteComponents";
import "./NoteDialogNote.scss";
import {Participant} from "../../../types/participant";

export type NoteDialogNoteProps = {
  noteId?: string;
  parentId?: string;
  text: string;
  authorId: string;
  authorCustomAvatar?: AvataaarProps;
  authorName: string;
  showAuthors: boolean;
  onClose: () => void;
  onDeleteOfParent: () => void;
  showUnstackButton: boolean;

  viewer: Participant;
};

export const NoteDialogNote: FC<NoteDialogNoteProps> = (props: NoteDialogNoteProps) => (
  <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": props.viewer.user.id === props.authorId})}>
    <NoteDialogNoteComponents.Content {...props} />
    <NoteDialogNoteComponents.Footer {...props} />
  </div>
);
