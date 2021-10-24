import classNames from "classnames";
import Parse from "parse";
import {FC} from "react";
import store from "store";
import {ActionFactory} from "store/action";
import "./NoteDialogNoteContent.scss";

type NoteDialogNoteContentProps = {
  noteId?: string;
  authorId: string;
  currentUserIsModerator: boolean;
  activeModeration: {userId?: string; status: boolean};
  text: string;
};

export const NoteDialogNoteContent: FC<NoteDialogNoteContentProps> = ({noteId, authorId, currentUserIsModerator, activeModeration, text}: NoteDialogNoteContentProps) => {
  const editable = (authorId: string) => (Parse.User.current()?.id === authorId || currentUserIsModerator) && !activeModeration.status;

  const onEdit = (id: string, authorId: string, newText: string) => {
    if (editable(authorId) && newText != text) {
      store.dispatch(ActionFactory.editNote({id, text: newText}));
    }
  };

  return (
    <div className="note-dialog__note-content">
      <blockquote
        className={classNames("note-dialog__note-content__text", {".note-dialog__note-content__text-hover": editable(authorId)})}
        contentEditable={editable(authorId)}
        suppressContentEditableWarning
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          onEdit(noteId!, authorId, e.target.textContent as string);
        }}
      >
        {text}
      </blockquote>
    </div>
  );
};
