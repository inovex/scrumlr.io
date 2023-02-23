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
  noteId: string;
  authorId: string;
  onDeleteOfParent: () => void;
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

  const onDelete = (id: string, deleteStack?: boolean) => {
    if (props.hasStackedNotes && !showParentDialog) {
      setShowParentDialog(true);
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

    if (deleteStack) {
      alert("stack wird gelöscht");
    } else {
      alert("note wird gelöscht");
    }
    // dispatch(Actions.deleteNote(id, deleteStack))
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
                onDelete(props.noteId); // reduce ??
                // props.onDeleteOfParent(); remove ??
              }}
              label={props.isStackedNote || !props.hasStackedNotes ? t("NoteDialogDeleteNoteButton.title") : t("NoteDialogDeleteStackButton.title")}
              icon={DeleteIcon}
            />
          </li>
        )}
      </ul>
      {showChildDialog && (
        <ConfirmationDialog title="Are you sure that you want to delete this note?" onAccept={() => onDelete(props.noteId, false)} onDecline={() => setShowChildDialog(false)} />
      )}
      {showParentDialog && (
        <ConfirmationDialog
          title="What do you want to delete?"
          onAccept={() => onDelete(props.noteId, false)} // del Note
          onDecline={() => setShowParentDialog(false)} // cancel
          onExtraOption={() => onDelete(props.noteId, true)}
        /> // del Stack
      )}
    </>
  );
};
