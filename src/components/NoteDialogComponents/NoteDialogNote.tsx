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
  onClose: () => void;
  isStackedNote: boolean;
  hasStackedNotes?: boolean;
  stackHasMixedAuthors?: boolean;
  className?: string;

  viewer: Participant;
};

export const NoteDialogNote: FC<NoteDialogNoteProps> = (props: NoteDialogNoteProps) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": props.viewer.user.id === props.authorId}, props.className)} onClick={(e) => e.stopPropagation()}>
    <header className="note-dialog-note__header">
      <NoteDialogNoteComponents.Header {...props} />
    </header>
    <aside className="note-dialog-note__options">
      <NoteDialogNoteComponents.Options {...props} />
    </aside>
    <NoteDialogNoteComponents.Content {...props} /> {/* no wrapper because of weird behaviour */}
    <footer className="note-dialog-note__footer">
      <NoteDialogNoteComponents.Footer {...props} />
    </footer>
  </div>
);
