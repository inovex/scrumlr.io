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
  isStackedNote: boolean;
  hasStackedNotes?: boolean;
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
      {props.isStackedNote && (
        <li className="note-dialog__note-option">
          <TooltipButton
            onClick={() => {
              onUnstack(props.noteId);
              props.onClose();
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
              onDelete(props.noteId);
              props.onDeleteOfParent();
            }}
            label={props.isStackedNote || !props.hasStackedNotes ? t("NoteDialogDeleteNoteButton.title") : t("NoteDialogDeleteStackButton.title")}
            icon={DeleteIcon}
          />
        </li>
      )}
    </ul>
  );
};
