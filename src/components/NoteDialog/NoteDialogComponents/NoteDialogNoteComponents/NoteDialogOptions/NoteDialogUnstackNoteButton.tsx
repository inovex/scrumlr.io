import {FC} from "react";
import {IconButton} from "components/IconButton";
import store from "store";
import {ActionFactory} from "store/action";
import {ReactComponent as unstackIcon} from "assets/icon-unstack.svg";

type NoteDialogUnstackNoteProps = {
  noteId?: string;
  onClose: () => void;
};

export const NoteDialogUnstackNoteButton: FC<NoteDialogUnstackNoteProps> = ({noteId, onClose}: NoteDialogUnstackNoteProps) => {
  const onUnstack = (id: string) => {
    store.dispatch(ActionFactory.editNote({id, parentId: "unstack"}));
  };

  return (
    <IconButton
      onClick={() => {
        onUnstack(noteId!);
        onClose();
      }}
      direction="right"
      label="Unstack"
      icon={unstackIcon}
    />
  );
};
