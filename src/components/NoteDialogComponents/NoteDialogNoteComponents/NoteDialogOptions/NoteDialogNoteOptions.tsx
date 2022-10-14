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
  noteId: string;
  authorId: string;
  showUnstackButton: boolean;
  isParent?: boolean;
  viewer: Participant;
  onClose: () => void;
};

export const NoteDialogNoteOptions: FC<NoteDialogNoteOptionsProps> = (props: NoteDialogNoteOptionsProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const [showParentDialog, setShowParentDialog] = useState<boolean>(false);
  const [showChildDialog, setShowChildDialog] = useState<boolean>(false);

  const onUnstack = (id: string) => {
    dispatch(Actions.unstackNote(id));
  };

  const onDelete = (id: string, deleteStack?: boolean) => {
    if (props.isParent && !showParentDialog) {
      setShowParentDialog(true);
      return;
    }
    if (!props.isParent && !showChildDialog) {
      setShowChildDialog(true);
      return;
    }
    dispatch(Actions.deleteNote(id, deleteStack));
  };

  const showDeleteButton = props.authorId === props.viewer.user.id || props.viewer.role === "OWNER" || props.viewer.role === "MODERATOR";
  return (
    <ul className="note-dialog__note-options">
      {props.showUnstackButton && (
        <li className="note-dialog__note-option">
          <TooltipButton
            onClick={() => {
              onUnstack(props.noteId);
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
            label={t("NoteDialogDeleteNoteButton.title")}
            icon={DeleteIcon}
          />
        </li>
      )}
      {showParentDialog && (
        <ConfirmationDialog onClose={() => setShowParentDialog(false)}>
          <div className="deletion-dialog">
            <DeleteIcon />
            <div>
              <div className="deletion-dialog__info-row">
                <h1>{t(`NoteDeletionDialog.titleParentNote`)}</h1>
                <p>{t(`NoteDeletionDialog.warning`)}</p>
              </div>
              <div className="deletion-dialog__button-row">
                <button onClick={() => onDelete(props.noteId, false)}>{t(`NoteDeletionDialog.deleteNote`)}</button>
                <button onClick={() => onDelete(props.noteId, true)}>{t(`NoteDeletionDialog.deleteStack`)}</button>
                <button onClick={() => setShowParentDialog(false)}>{t(`NoteDeletionDialog.cancel`)}</button>
              </div>
            </div>
          </div>
        </ConfirmationDialog>
      )}
      {showChildDialog && (
        <ConfirmationDialog onClose={() => setShowChildDialog(false)}>
          <div className="deletion-dialog">
            <DeleteIcon />
            <div>
              <div className="deletion-dialog__info-row">
                <h1>{t(`NoteDeletionDialog.titleNote`)}</h1>
                <p>{t(`NoteDeletionDialog.warning`)}</p>
              </div>
              <div className="deletion-dialog__button-row">
                <button onClick={() => onDelete(props.noteId, false)}>{t(`NoteDeletionDialog.deleteNote`)}</button>
                <button onClick={() => setShowChildDialog(false)}>{t(`NoteDeletionDialog.cancel`)}</button>
              </div>
            </div>
          </div>
        </ConfirmationDialog>
      )}
    </ul>
  );
};
