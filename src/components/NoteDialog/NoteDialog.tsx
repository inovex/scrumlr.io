import classNames from "classnames";
import {Portal} from "components/Portal";
import {Color, getColorClassName} from "constants/colors";
import {NoteClientModel} from "types/note";
import {VoteClientModel} from "types/vote";
import "./NoteDialog.scss";
import {NoteDialogHeader, NoteDialogNote} from "./NoteDialogComponents";

interface NoteDialogProps {
  noteId?: string;
  text: string;
  authorId: string;
  columnName: string;
  columnColor: string;
  show: boolean;
  authorName: string;
  showAuthors: boolean;
  onClose: () => void;
  onDeleteOfParent: () => void;
  childrenNotes: Array<NoteClientModel & {authorName: string; votes: VoteClientModel[]}>;
  votes: VoteClientModel[];
  activeVoting: boolean;
  activeModeration: {userId?: string; status: boolean};
  currentUserIsModerator: boolean;
}

export const NoteDialog = (props: NoteDialogProps) => {
  if (!props.show) {
    return null;
  }
  return (
    <Portal onClose={props.onClose} darkBackground>
      <div
        className={classNames(
          "note-dialog",
          getColorClassName(props.columnColor as Color),
          {"note-dialog__pointer-moderator": props.currentUserIsModerator && props.activeModeration.status},
          {"note-dialog__disabled-pointer": !props.currentUserIsModerator && props.activeModeration.status}
        )}
      >
        <NoteDialogHeader columnName={props.columnName} />
        <NoteDialogNote {...props} showUnstackButton={false} />
        {props.childrenNotes.map((note) => (
          <NoteDialogNote {...props} {...note} showUnstackButton key={note.id} noteId={note.id} authorId={note.author} />
        ))}
        ;
      </div>
    </Portal>
  );
};
