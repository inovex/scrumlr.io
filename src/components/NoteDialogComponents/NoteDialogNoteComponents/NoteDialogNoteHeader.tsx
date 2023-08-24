import {NoteAuthorList} from "components/Note/NoteAuthorList/NoteAuthorList";
import {Participant} from "types/participant";
import {useAppSelector} from "store";
import {Votes} from "../../Votes";
import {AvataaarProps} from "../../Avatar";
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
      <NoteAuthorList authors={[author]} showAuthors={props.showAuthors} viewer={props.viewer} />
      <Votes {...props} className="note-dialog__note-votes" />
    </div>
  );
};
