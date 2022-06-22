import classNames from "classnames";
import {FC} from "react";
import {Actions} from "store/action";
import "./NoteDialogNoteContent.scss";
import {useDispatch} from "react-redux";
import {Participant} from "types/participant";

type NoteDialogNoteContentProps = {
  noteId?: string;
  authorId: string;
  text: string;
  viewer: Participant;
};

export const NoteDialogNoteContent: FC<NoteDialogNoteContentProps> = ({noteId, authorId, text, viewer}: NoteDialogNoteContentProps) => {
  const dispatch = useDispatch();
  const editable = viewer.user.id === authorId || viewer.role === "OWNER" || viewer.role === "MODERATOR";

  const onEdit = (id: string, newText: string) => {
    if (editable && newText !== text) {
      dispatch(Actions.editNote(id, {text: newText}));
    }
  };

  return (
    <div className="note-dialog__note-content">
      <textarea
        tabIndex={editable ? 0 : -1}
        className={classNames("note-dialog__note-content__text", {".note-dialog__note-content__text-hover": editable})}
        disabled={!editable}
        suppressContentEditableWarning
        value={text}
        onBlur={(e) => {
          onEdit(noteId!, e.target.value ?? "");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLTextAreaElement).blur();
          }
        }}
      />
    </div>
  );
};
