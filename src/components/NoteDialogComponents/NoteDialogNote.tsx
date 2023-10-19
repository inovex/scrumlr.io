import classNames from "classnames";
import {FC} from "react";
import {AvataaarProps} from "components/Avatar";
import {Participant} from "types/participant";
import {NoteDialogNoteComponents} from "./NoteDialogNoteComponents";
import "./NoteDialogNote.scss";

export type NoteDialogNoteProps = {
  noteId: string;
  text: string;
  authorId: string;
  avatar?: AvataaarProps;
  authorName: string;
  showAuthors: boolean;
  showNoteReactions: boolean;
  onClose: () => void;
  isStackedNote: boolean;
  hasStackedNotes?: boolean;
  stackHasMixedAuthors?: boolean;
  className?: string;
  colorClassName?: string;

  viewer: Participant;
};

export const NoteDialogNote: FC<NoteDialogNoteProps> = (props: NoteDialogNoteProps) => (
  <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": props.viewer.user.id === props.authorId}, props.className)} onClick={(e) => e.stopPropagation()}>
    <header className="note-dialog-note__header">
      <NoteDialogNoteComponents.Header {...props} />
    </header>
    <main className="note-dialog-note__main">
      <NoteDialogNoteComponents.Content {...props} />
    </main>
    <aside className="note-dialog-note__options">
      <NoteDialogNoteComponents.Options {...props} />
    </aside>
    <footer className="note-dialog-note__footer">
      <NoteDialogNoteComponents.Footer {...props} />
    </footer>
  </div>
);
