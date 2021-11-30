import {FC} from "react";
import store from "store";
import {ActionFactory} from "store/action";
import {ReactComponent as UnstackIcon} from "assets/icon-unstack.svg";
import {DotButton} from "components/DotButton";
import "./NoteDialogUnstackNoteButton.scss";
import {TabIndex} from "constants/tabIndex";
import {useTranslation} from "react-i18next";

type NoteDialogUnstackNoteProps = {
  noteId?: string;
  parentId?: string;
  onClose: () => void;
};

export var NoteDialogUnstackNoteButton: FC<NoteDialogUnstackNoteProps> = function ({noteId, parentId, onClose}: NoteDialogUnstackNoteProps) {
  const {t} = useTranslation();

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
      title={t("NoteDialogUnstackNoteButton.title")}
    >
      <UnstackIcon className="note-dialog__note-option__unstack-icon" />
    </DotButton>
  );
};
