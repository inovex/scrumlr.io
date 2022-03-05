import {FC} from "react";
import {Actions} from "store/action";
import {ReactComponent as UnstackIcon} from "assets/icon-unstack.svg";
import {DotButton} from "components/DotButton";
import "./NoteDialogUnstackNoteButton.scss";
import {TabIndex} from "constants/tabIndex";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";

type NoteDialogUnstackNoteProps = {
  noteId?: string;
  onClose: () => void;
};

export const NoteDialogUnstackNoteButton: FC<NoteDialogUnstackNoteProps> = ({noteId, onClose}: NoteDialogUnstackNoteProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const onUnstack = (id: string) => {
    dispatch(Actions.unstackNote(id));
  };

  return (
    <DotButton
      onClick={() => {
        onUnstack(noteId!);
        onClose();
      }}
      className="note-dialog__note-option__unstack"
      tabIndex={TabIndex.default}
      title={t("NoteDialogUnstackNoteButton.title")}
    >
      <UnstackIcon className="note-dialog__note-option__unstack-icon" />
    </DotButton>
  );
};
