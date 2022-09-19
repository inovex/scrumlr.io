import {FC} from "react";
import {Participant} from "types/participant";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {ReactComponent as UnstackIcon} from "assets/icon-unstack.svg";
import "./NoteDialogNoteOptions.scss";
import {TooltipButton} from "components/TooltipButton/TooltipButton";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";

type NoteDialogNoteOptionsProps = {
  showUnstackButton: boolean;
  noteId: string;
  authorId: string;
  onDeleteOfParent: () => void;
  onClose: () => void;
  viewer: Participant;
};

export const NoteDialogNoteOptions: FC<NoteDialogNoteOptionsProps> = ({showUnstackButton, noteId, authorId, onDeleteOfParent, onClose, viewer}: NoteDialogNoteOptionsProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const onUnstack = (id: string) => {
    dispatch(Actions.unstackNote(id));
  };

  const onDelete = (id: string) => {
    dispatch(Actions.deleteNote(id));
  };

  const showDeleteButton = authorId === viewer.user.id || viewer.role === "OWNER" || viewer.role === "MODERATOR";
  return (
    <ul className="note-dialog__note-options">
      {showUnstackButton && (
        <li className="note-dialog__note-option">
          <TooltipButton
            onClick={() => {
              onUnstack(noteId);
              onClose();
            }}
            label={t("NoteDialogUnstackNoteButton.title")}
            icon={UnstackIcon}
          />
        </li>
      )}
      {showDeleteButton && (
        <li className="note-dialog__note-option">
          <TooltipButton
            onClick={() => {
              onDelete(noteId);
              onDeleteOfParent();
            }}
            label={t("NoteDialogDeleteNoteButton.title")}
            icon={DeleteIcon}
          />
        </li>
      )}
    </ul>
  );
};
