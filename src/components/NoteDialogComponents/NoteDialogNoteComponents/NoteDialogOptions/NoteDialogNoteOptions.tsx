import {FC} from "react";
import {Participant} from "types/participant";
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

export const NoteDialogNoteOptions: FC<NoteDialogNoteOptionsProps> = (props: NoteDialogNoteOptionsProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const onUnstack = (id: string) => {
    dispatch(Actions.unstackNote(id));
  };

  const onDelete = (id: string) => {
    dispatch(Actions.deleteNote(id));
  };

  const showDeleteButton = props.authorId === props.viewer.user.id || props.viewer.role === "OWNER" || props.viewer.role === "MODERATOR";
  return (
    <ul className="note-dialog__note-options">
      {props.showUnstackButton && (
        <li className="note-dialog__note-option">
          <TooltipButton
            onClick={() => {
              onUnstack(props.noteId);
              props.onClose();
            }}
            label={t("NoteDialogUnstackNoteButton.title")}
            // TODO unstack icon here
            icon="ic_focus"
          />
        </li>
      )}
      {showDeleteButton && (
        <li className="note-dialog__note-option">
          <TooltipButton
            onClick={() => {
              onDelete(props.noteId);
              props.onDeleteOfParent();
            }}
            label={t("NoteDialogDeleteNoteButton.title")}
            // TODO delete icon here
            icon="ic_focus"
          />
        </li>
      )}
    </ul>
  );
};
