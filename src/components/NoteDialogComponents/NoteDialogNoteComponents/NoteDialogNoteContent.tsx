import {FC} from "react";
import {Actions} from "store/action";
import "./NoteDialogNoteContent.scss";
import {useDispatch} from "react-redux";
import {Participant} from "types/participant";
import {useImageChecker} from "utils/hooks/useImageChecker";
import {addProtocol} from "utils/images";

type NoteDialogNoteContentProps = {
  noteId?: string;
  authorId: string;
  text: string;
  viewer: Participant;
};

export const NoteDialogNoteContent: FC<NoteDialogNoteContentProps> = ({noteId, authorId, text, viewer}: NoteDialogNoteContentProps) => {
  const dispatch = useDispatch();
  const editable = viewer.user.id === authorId || viewer.role === "OWNER" || viewer.role === "MODERATOR";

  const onFocus = () => {
    dispatch(Actions.onNoteFocus());
  };

  const onEdit = (id: string, newText: string) => {
    if (editable && newText !== text) {
      dispatch(Actions.editNote(id, {text: newText}));
    }
    dispatch(Actions.onNoteBlur());
  };

  const isImage = useImageChecker(text);

  return (
    <div className="note-dialog__note-content">
      {isImage ? (
        <img
          src={addProtocol(text)}
          className="note-dialog__note-content--image"
          alt="user-provided media"
          draggable={false} // safari bugfix
        />
      ) : (
        <textarea
          className="note-dialog__note-content--text"
          disabled={!editable}
          onBlur={(e) => onEdit(noteId!, e.target.value ?? "")}
          onFocus={onFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLTextAreaElement).blur();
            }
          }}
          defaultValue={text}
        />
      )}
    </div>
  );
};
