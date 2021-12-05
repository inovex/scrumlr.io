import classNames from "classnames";
import {Portal} from "components/Portal";
import {Color, getColorClassName} from "constants/colors";
import {NoteClientModel} from "types/note";
import {VoteClientModel} from "types/vote";
import "./NoteDialog.scss";
import Parse from "parse";
import {NoteDialogComponents} from "./NoteDialogComponents";

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
  allVotesOfUser: VoteClientModel[];
  activeVoting: boolean;
  activeModeration: {userId?: string; status: boolean};
  currentUserIsModerator: boolean;
}

export const NoteDialog = (props: NoteDialogProps) => {
  if (!props.show) {
    return null;
  }
  return (
    <Portal onClose={props.onClose} darkBackground hiddenOverflow centered disabledPadding>
      <div
        className={classNames(
          "note-dialog",
          getColorClassName(props.columnColor as Color),
          {"note-dialog__pointer-moderator": props.activeModeration.userId === Parse.User.current()?.id && props.activeModeration.status},
          {"note-dialog__disabled-pointer": props.activeModeration.userId !== Parse.User.current()?.id && props.activeModeration.status}
        )}
      >
        <NoteDialogComponents.Header columnName={props.columnName} />
        <NoteDialogComponents.Wrapper>
          <NoteDialogComponents.Note {...props} showUnstackButton={false} />
          {props.childrenNotes.map((note) => (
            <NoteDialogComponents.Note {...props} {...note} parentId={props.noteId} key={note.id} showUnstackButton noteId={note.id} authorId={note.author} />
          ))}
        </NoteDialogComponents.Wrapper>
      </div>
    </Portal>
  );
};
