import {NoteAuthorList} from "components/Note/NoteAuthorList/NoteAuthorList";
import {Participant} from "types/participant";
import {useAppSelector} from "store";

interface NoteDialogNoteHeaderProps {
  authorId: string;
  showAuthors: boolean;
  viewer: Participant;
}

export const NoteDialogNoteHeader = (props: NoteDialogNoteHeaderProps) => {
  const me = useAppSelector((state) => state.participants?.self);
  const others = useAppSelector((state) => state.participants?.others) ?? [];
  const participants = [me, ...others];
  const author = participants.find((p) => p?.user.id === props.authorId)!;
  return (
    <div className="note-dialog-note-header__root">
      <NoteAuthorList authors={[author]} showAuthors={props.showAuthors} viewer={props.viewer} />
    </div>
  );
};
