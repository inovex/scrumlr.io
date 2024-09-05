import {FC, useState} from "react";
import {Participant} from "store/features/participants/types";
import {Trash, Eject} from "components/Icon";
import "./NoteDialogNoteOptions.scss";
import {useTranslation} from "react-i18next";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {useAppDispatch} from "store";
import {deleteNote, unstackNote} from "store/features";

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
  const dispatch = useAppDispatch();

  const [showParentDialog, setShowParentDialog] = useState<boolean>(false);
  const [showChildDialog, setShowChildDialog] = useState<boolean>(false);

  const onUnstack = (id: string) => {
    dispatch(unstackNote({noteId: id}));
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
    dispatch(deleteNote({noteId: id, deleteStack: !!deleteStack}));
  };

  const showDeleteButton = props.authorId === props.viewer.user.id || props.viewer.role === "OWNER" || props.viewer.role === "MODERATOR";
  return (
    <>
      <ul className="note-dialog__note-options">
        {props.isStackedNote && (
          <li className="note-dialog__note-option">
            <button
              data-tooltip-id="scrumlr-tooltip"
              data-tooltip-content={t("NoteDialogUnstackNoteButton.title")}
              aria-label={t("NoteDialogUnstackNoteButton.title")}
              className="note-option__button"
              onClick={() => {
                onUnstack(props.noteId);
                props.onClose();
              }}
            >
              <Eject />
            </button>
          </li>
        )}
        {showDeleteButton && (
          <li className="note-dialog__note-option">
            <button
              data-tooltip-id="scrumlr-tooltip"
              data-tooltip-content={
                props.isStackedNote || !props.hasStackedNotes || !allowedToDeleteStack ? t("NoteDialogDeleteNoteButton.title") : t("NoteDialogDeleteStackButton.title")
              }
              aria-label={props.isStackedNote || !props.hasStackedNotes || !allowedToDeleteStack ? t("NoteDialogDeleteNoteButton.title") : t("NoteDialogDeleteStackButton.title")}
              className="note-option__button"
              onClick={() => {
                onDelete(props.noteId);
              }}
            >
              <Trash />
            </button>
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
          icon={Trash}
          warning
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
          icon={Trash}
          warning
        />
      )}
    </>
  );
};
