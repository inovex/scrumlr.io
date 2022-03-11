import classNames from "classnames";
import {FC} from "react";
import {Vote} from "types/vote";
import {NoteDialogNoteComponents} from "./NoteDialogNoteComponents";
import "./NoteDialogNote.scss";
import {Participant} from "../../../types/participant";

export type NoteDialogNoteProps = {
  noteId?: string;
  parentId?: string;
  text: string;
  authorId: string;
  authorName: string;
  showAuthors: boolean;
  onClose: () => void;
  onDeleteOfParent: () => void;
  votes: number;
  allVotesOfUser: Vote[];
  activeVoting: boolean;
  showUnstackButton: boolean;

  viewer: Participant;
};

export const NoteDialogNote: FC<NoteDialogNoteProps> = (props: NoteDialogNoteProps) => (
  <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": props.viewer.user.id === props.authorId})}>
    <NoteDialogNoteComponents.Content {...props} />
    <NoteDialogNoteComponents.Footer {...props} />
  </div>
);
