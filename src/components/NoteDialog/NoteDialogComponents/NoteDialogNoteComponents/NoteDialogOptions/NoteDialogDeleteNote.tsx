import {ReactComponent as deleteIcon} from "assets/icon-delete.svg";
import {IconButton} from "components/IconButton";
import {FC} from "react";
import store from "store";
import {ActionFactory} from "store/action";
import "./NoteDialogOptions.scss";

type NoteDialogDeleteNoteProps = {
  noteId?: string;
  onDeleteOfParent: () => void;
};

export const NoteDialogDeleteNote: FC<NoteDialogDeleteNoteProps> = ({noteId, onDeleteOfParent}) => {
  const onDelete = (id: string) => {
    store.dispatch(ActionFactory.deleteNote(id));
  };

  return (
    <li className="note-dialog__option">
      <IconButton
        onClick={() => {
          onDelete(noteId!);
          onDeleteOfParent();
        }}
        direction="right"
        label="Delete"
        icon={deleteIcon}
      />
    </li>
  );
};
