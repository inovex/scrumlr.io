import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {DotButton} from "components/DotButton";
import {TabIndex} from "constants/tabIndex";
import {FC} from "react";
import store from "store";
import {ActionFactory} from "store/action";
import "./NoteDialogDeleteNoteButton.scss";
import {useTranslation} from "react-i18next";

type NoteDialogDeleteNoteProps = {
  noteId?: string;
  onDeleteOfParent: () => void;
};

export var NoteDialogDeleteNoteButton: FC<NoteDialogDeleteNoteProps> = function({noteId, onDeleteOfParent}: NoteDialogDeleteNoteProps) {
  const {t} = useTranslation();

  const onDelete = (id: string) => {
    store.dispatch(ActionFactory.deleteNote(id));
  };

  return (
    <DotButton
      onClick={() => {
        onDelete(noteId!);
        onDeleteOfParent();
      }}
      className="note-dialog__note-option__remove"
      tabIndex={TabIndex.default}
      title={t("NoteDialogDeleteNoteButton.title")}
    >
      <DeleteIcon className="note-dialog__note-option__remove-icon" />
    </DotButton>
  );
}
