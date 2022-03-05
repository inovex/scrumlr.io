import classNames from "classnames";
import {FC} from "react";
import {Actions} from "store/action";
import "./NoteDialogNoteContent.scss";
import {useDispatch} from "react-redux";

type NoteDialogNoteContentProps = {
  noteId?: string;
  authorId: string;
  currentUserIsModerator: boolean;
  activeModeration: {userId?: string; status: boolean};
  text: string;
};

export const NoteDialogNoteContent: FC<NoteDialogNoteContentProps> = ({noteId, authorId, currentUserIsModerator, activeModeration, text}: NoteDialogNoteContentProps) => {
  const dispatch = useDispatch();
  const editable = (editorId: string) => (Parse.User.current()?.id === editorId || currentUserIsModerator) && !activeModeration.status;

  const onEdit = (id: string, editorId: string, newText: string) => {
    if (editable(editorId) && newText !== text) {
      dispatch(Actions.editNote({id, text: newText}));
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
