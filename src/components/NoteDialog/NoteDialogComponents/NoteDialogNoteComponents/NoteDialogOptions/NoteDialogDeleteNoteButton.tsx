import {ReactComponent as deleteIcon} from "assets/icon-delete.svg";
import {IconButton} from "components/IconButton";
import {FC} from "react";
import store from "store";
import {ActionFactory} from "store/action";

type NoteDialogDeleteNoteProps = {
  noteId?: string;
  onDeleteOfParent: () => void;
};

export const NoteDialogDeleteNoteButton: FC<NoteDialogDeleteNoteProps> = ({noteId, onDeleteOfParent}: NoteDialogDeleteNoteProps) => {
  const onDelete = (id: string) => {
    store.dispatch(ActionFactory.deleteNote(id));
  };

  return (
    <IconButton
      onClick={() => {
        onDelete(noteId!);
        onDeleteOfParent();
      }}
      direction="right"
      label="Delete"
      icon={deleteIcon}
    />
  );
};
