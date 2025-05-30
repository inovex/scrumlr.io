import {NoteAuthorList} from "components/Note/NoteAuthorList/NoteAuthorList";
import {Participant} from "store/features/participants/types";
import {useAppSelector} from "store";
import {AvataaarProps} from "types/avatar";
import {Votes} from "../../Votes";
import "./NoteDialogNoteHeader.scss";

interface NoteDialogNoteHeaderProps {
  showAuthors: boolean;
  authorId: string;
  avatar?: AvataaarProps;
  authorName: string;
  noteId: string;
  viewer: Participant;
  colorClassName?: string;
}

export const NoteDialogNoteHeader = (props: NoteDialogNoteHeaderProps) => {
  const me = useAppSelector((state) => state.participants?.self);
  const others = useAppSelector((state) => state.participants?.others) ?? [];
  const participants = [me, ...others];
  const author = participants.find((p) => p?.user.id === props.authorId)!;
  return (
    <div className="note-dialog-note-header__root">
      <div data-clarity-mask="True" className="note-dialog-note-header__author-list-container">
        <NoteAuthorList authors={[author]} authorID={props.authorId} showAuthors={props.showAuthors} viewer={props.viewer} />
      </div>
      <Votes {...props} className="note-dialog__note-votes" />
    </div>
  );
};
