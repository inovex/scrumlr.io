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
  onDeleteOfParent: () => void;
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
              // props.onDeleteOfParent(); leads to no-display of confidialog
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
                <h1>What do you want to delete?</h1>
                <p>This note or stack will be deleted immediately.</p>
                <p>This action can not be revoked.</p>
              </div>
              <div className="deletion-dialog__button-row">
                <button onClick={() => onDelete(props.noteId, false)}>Delete note</button>
                <button onClick={() => onDelete(props.noteId, true)}>Delete stack</button>
                <button onClick={() => setShowParentDialog(false)}>Cancel</button>
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
                <h1>Are you realy sure that do you want to delete this note?</h1>
                <p>This note will be deleted immediately.</p>
                <p>This action can not be revoked.</p>
              </div>
              <div className="deletion-dialog__button-row">
                <button onClick={() => onDelete(props.noteId, false)}>Delete note</button>
                <button onClick={() => setShowChildDialog(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </ConfirmationDialog>
      )}
    </ul>
  );
};
