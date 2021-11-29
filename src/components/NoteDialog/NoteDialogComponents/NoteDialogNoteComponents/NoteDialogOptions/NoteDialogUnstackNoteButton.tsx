import {FC} from "react";
import store from "store";
import {ActionFactory} from "store/action";
import {ReactComponent as UnstackIcon} from "assets/icon-unstack.svg";
import {DotButton} from "components/DotButton";
import "./NoteDialogUnstackNoteButton.scss";
import {TabIndex} from "constants/tabIndex";

type NoteDialogUnstackNoteProps = {
  noteId?: string;
  parentId?: string;
  onClose: () => void;
};

export var NoteDialogUnstackNoteButton: FC<NoteDialogUnstackNoteProps> = function({noteId, parentId, onClose}: NoteDialogUnstackNoteProps) {
  const onUnstack = (id: string, parentId: string) => {
    store.dispatch(ActionFactory.unstackNote({id, parentId}));
  };

  return (
    <DotButton
      onClick={() => {
        onUnstack(noteId!, parentId!);
        onClose();
      }}
      className="note-dialog__note-option__unstack"
      tabIndex={TabIndex.default}
    >
      <UnstackIcon className="note-dialog__note-option__unstack-icon" />
    </DotButton>
  );
}
