import {FC, useRef} from "react";
import {Participant} from "types/participant";
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {ReactComponent as UnstackIcon} from "assets/icon-unstack.svg";
import "./NoteDialogNoteOptions.scss";
import {TooltipButton} from "components/TooltipButton/TooltipButton";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {Toast} from "utils/Toast";
import {useAppSelector} from "store";

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
  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId));

  const revertedUnstack = useRef<boolean | null>(false);
  const reStackNote = () => {
    revertedDeletion.current = true;
    dispatch(Actions.reStackNote(note!));
  };
  const handleFinalUnstack = () => {
    if (revertedUnstack.current) {
      revertedUnstack.current = null;
      
    } else {
      dispatch(Actions.unstackNote(props.noteId));
      revertedUnstack.current = null;
    }
  };
  const onUnstack = (id: string) => {
    dispatch(Actions.unstackNoteTemporary(note!.id));
    Toast.info(
      <>
        <div>Karte entstapelt</div>
        <button onClick={reStackNote}>Undo</button>
      </>,
      undefined,
      {case: "unstackedNote", callback: handleFinalUnstack}
    );
    
    // dispatch(Actions.unstackNote(id));
  };

  const revertedDeletion = useRef<boolean | null>(false);
  const readdNote = () => {
    revertedDeletion.current = true;
    dispatch(Actions.reAddNote(note!));
  };
  const handleFinalDeletion = () => {
    if (revertedDeletion.current) {
      revertedDeletion.current = null;
      
    } else {
      dispatch(Actions.deleteNote(props.noteId));
      revertedDeletion.current = null;
    }
  };
  const onDelete = (id: string) => {
    dispatch(Actions.deleteNoteTemporary(note!.id));
    Toast.info(
      <>
        <div>Karte gelöscht</div>
        <button onClick={readdNote}>Undo</button>
      </>,
      undefined,
      {case: "deletedNote", callback: handleFinalDeletion}
    );
    
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
