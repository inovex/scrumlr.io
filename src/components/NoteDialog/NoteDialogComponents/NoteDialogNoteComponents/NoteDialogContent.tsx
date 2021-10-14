import classNames from "classnames";
import Parse from "parse";
import {FC} from "react";
import store from "store";
import {ActionFactory} from "store/action";
import "./NoteDialogContent.scss";

type NoteDialogContentProps = {
  noteId?: string;
  authorId: string;
  currentUserIsModerator: boolean;
  activeModeration: {userId?: string; status: boolean};
  text: string;
};

export const NoteDialogContent: FC<NoteDialogContentProps> = ({noteId, authorId, currentUserIsModerator, activeModeration, text}) => {
  const editable = (authorId: string) => (Parse.User.current()?.id === authorId || currentUserIsModerator) && !activeModeration.status;

  const onEdit = (id: string, authorId: string, text: string) => {
    if (editable(authorId)) {
      store.dispatch(ActionFactory.editNote({id, text}));
    }
  };

  return (
    <div className="note-dialog__content">
      <blockquote
        className={classNames("note-dialog__text", {".note-dialog__text-hover": editable(authorId)})}
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
