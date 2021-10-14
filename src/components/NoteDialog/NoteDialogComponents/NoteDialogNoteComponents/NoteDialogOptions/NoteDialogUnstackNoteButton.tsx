import {FC} from "react";
import {IconButton} from "components/IconButton";
import store from "store";
import {ActionFactory} from "store/action";
import {ReactComponent as unstackIcon} from "assets/icon-unstack.svg";
import "./NoteDialogOptions.scss";

type NoteDialogUnstackNoteProps = {
  noteId?: string;
  onClose: () => void;
};

export const NoteDialogUnstackNoteButton: FC<NoteDialogUnstackNoteProps> = ({noteId, onClose}: NoteDialogUnstackNoteProps) => {
  const onUnstack = (id: string) => {
    store.dispatch(ActionFactory.editNote({id, parentId: "unstack"}));
  };

  return (
    <li className="note-dialog__option">
      <IconButton
        onClick={() => {
          onUnstack(noteId!);
          onClose();
        }}
        direction="right"
        label="Unstack"
        icon={unstackIcon}
      />
    </li>
  );
};
