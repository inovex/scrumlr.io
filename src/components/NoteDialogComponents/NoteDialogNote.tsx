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

export const NoteDialogNote: FC<NoteDialogNoteProps> = ({
  noteId,
  text,
  authorId,
  avatar,
  authorName,
  showAuthors,
  onClose,
  onDeleteOfParent,
  showUnstackButton,
  className,
  viewer,
}: NoteDialogNoteProps) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": viewer.user.id === authorId}, className)} onClick={(e) => e.stopPropagation()}>
    <NoteDialogNoteComponents.Content authorId={authorId} text={text} viewer={viewer} noteId={noteId} />
    <NoteDialogNoteComponents.Options
      authorId={authorId}
      noteId={noteId}
      onClose={onClose}
      onDeleteOfParent={onDeleteOfParent}
      showUnstackButton={showUnstackButton}
      viewer={viewer}
    />
    <NoteDialogNoteComponents.Footer authorId={authorId} authorName={authorName} noteId={noteId} showAuthors={showAuthors} viewer={viewer} avatar={avatar} />
  </div>
);
