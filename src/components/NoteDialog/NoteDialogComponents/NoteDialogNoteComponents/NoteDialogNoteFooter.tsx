import {UserAvatar} from "components/BoardUsers";
import {Votes} from "components/Votes";
import {FC} from "react";
import {Participant} from "types/participant";
import {NoteDialogNoteOptions} from "./NoteDialogOptions";
import "./NoteDialogNoteFooter.scss";

type NoteDialogNoteFooterProps = {
  showAuthors: boolean;
  authorId: string;
  authorName: string;
  noteId?: string;
  parentId?: string;
  onDeleteOfParent: () => void;
  onClose: () => void;
  showUnstackButton: boolean;
  viewer: Participant;
};

export const NoteDialogNoteFooter: FC<NoteDialogNoteFooterProps> = (props: NoteDialogNoteFooterProps) => (
  <div className="note-dialog__note-footer">
    {(props.showAuthors || props.viewer.user.id === props.authorId) && (
      <figure className="note-dialog__note-author">
        <UserAvatar id={props.authorId} name={props.authorName} className="note-dialog__note-user-avatar" avatarClassName="note-dialog__note-user-avatar" />
        <figcaption className="note-dialog__note-author-name">{props.authorName}</figcaption>
      </figure>
    )}
    <div className="note-dialog__note-footer__options-and-votes">
      <Votes noteId={props.noteId!} />
      <NoteDialogNoteOptions {...props} />
    </div>
  </div>
);
