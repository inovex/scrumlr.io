import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {DotButton} from "components/DotButton";
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
    <DotButton
      onClick={() => {
        onDelete(noteId!);
        onDeleteOfParent();
      }}
    >
      <DeleteIcon className="" />
    </DotButton>
  );
};
