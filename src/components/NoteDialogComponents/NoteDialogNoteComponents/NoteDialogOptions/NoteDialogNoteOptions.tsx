import {FC, useState} from "react";
import {Participant} from "types/participant";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {ReactComponent as UnstackIcon} from "assets/icon-unstack.svg";
import "./NoteDialogNoteOptions.scss";
import {TooltipButton} from "components/TooltipButton/TooltipButton";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {ConfirmationDialog} from "components/ConfirmationDialog";

type NoteDialogNoteOptionsProps = {
  isStackedNote: boolean;
  hasStackedNotes?: boolean;
  stackHasMixedAuthors?: boolean;
  noteId: string;
  authorId: string;
  onClose: () => void;
  viewer: Participant;
};

export const NoteDialogNoteOptions: FC<NoteDialogNoteOptionsProps> = (props: NoteDialogNoteOptionsProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const [showParentDialog, setShowParentDialog] = useState<boolean>(false);
  const [showChildDialog, setShowChildDialog] = useState<boolean>(false);

  const onUnstack = (id: string) => {
    dispatch(Actions.unstackNote(id));
  };

  const allowedToDeleteStack = props.viewer.role === "OWNER" || props.viewer.role === "MODERATOR" || (props.authorId === props.viewer.user.id && !props.stackHasMixedAuthors);

  // determines which deletion dialog to show
  const onDelete = (id: string, deleteStack?: boolean) => {
    if (props.hasStackedNotes && !showParentDialog && allowedToDeleteStack) {
      setShowParentDialog(true);
      return;
    }
    if (props.hasStackedNotes && !allowedToDeleteStack && !showChildDialog) {
      setShowChildDialog(true);
      return;
    }
    if (props.isStackedNote && !showChildDialog) {
      setShowChildDialog(true);
      return;
    }
    if (!props.isStackedNote && !props.hasStackedNotes && !showChildDialog) {
      setShowChildDialog(true);
      return;
    }
    dispatch(Actions.deleteNote(id, deleteStack));
  };

  const showDeleteButton = props.authorId === props.viewer.user.id || props.viewer.role === "OWNER" || props.viewer.role === "MODERATOR";
  return (
    <>
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
              }}
              label={props.isStackedNote || !props.hasStackedNotes || !allowedToDeleteStack ? t("NoteDialogDeleteNoteButton.title") : t("NoteDialogDeleteStackButton.title")}
              icon={DeleteIcon}
            />
          </li>
        )}
      </ul>
      {showChildDialog && (
        <ConfirmationDialog
          title={t("ConfirmationDialog.deleteNote")}
          onAccept={() => onDelete(props.noteId, false)}
          onAcceptLabel={t("ConfirmationDialog.deleteNoteButton")}
          onDecline={() => setShowChildDialog(false)}
          onDeclineLabel={t("ConfirmationDialog.cancel")}
          onClose={() => setShowChildDialog(false)}
          icon={DeleteIcon}
          warning={t("ConfirmationDialog.deleteWarning")}
        />
      )}
      {showParentDialog && (
        <ConfirmationDialog
          title={t("ConfirmationDialog.deleteOptions")}
          onAccept={() => onDelete(props.noteId, false)}
          onAcceptLabel={t("ConfirmationDialog.deleteNoteButton")}
          onDecline={() => setShowParentDialog(false)}
          onDeclineLabel={t("ConfirmationDialog.cancel")}
          onExtraOption={() => onDelete(props.noteId, true)}
          onExtraOptionLabel={t("ConfirmationDialog.deleteStackButton")}
          onClose={() => setShowChildDialog(false)}
          icon={DeleteIcon}
          warning={t("ConfirmationDialog.deleteWarning")}
        />
      )}
    </>
  );
};
