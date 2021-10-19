import {FC} from "react";
import store from "store";
import {ActionFactory} from "store/action";
import {ReactComponent as UnstackIcon} from "assets/icon-unstack.svg";
import {DotButton} from "components/DotButton";

type NoteDialogUnstackNoteProps = {
  noteId?: string;
  onClose: () => void;
};

export const NoteDialogUnstackNoteButton: FC<NoteDialogUnstackNoteProps> = ({noteId, onClose}: NoteDialogUnstackNoteProps) => {
  const onUnstack = (id: string) => {
    store.dispatch(ActionFactory.editNote({id, parentId: "unstack"}));
  };

  return (
    <DotButton
      onClick={() => {
        onUnstack(noteId!);
        onClose();
      }}
    >
      <UnstackIcon className="" />
    </DotButton>
  );
};
