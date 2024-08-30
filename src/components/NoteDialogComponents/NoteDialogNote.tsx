import classNames from "classnames";
import {FC} from "react";
import {AvataaarProps} from "types/avatar";
import {Participant} from "store/features/participants/types";
import {useAppSelector} from "store";
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

export const NoteDialogNote: FC<NoteDialogNoteProps> = (props: NoteDialogNoteProps) => {
  const boardLocked = useAppSelector((state) => state.board.data!.isLocked);
  const isModerator = useAppSelector((state) => ["OWNER", "MODERATOR"].some((role) => role === state.participants!.self.role));

  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return (
    <div
      className={classNames("note-dialog__note", {"note-dialog__note--own-card": props.viewer.user.id === props.authorId}, props.className)}
      onClick={(e) => e.stopPropagation()}
    >
      <header className="note-dialog-note__header">
        <NoteDialogNoteComponents.Header {...props} />
      </header>
      <main className="note-dialog-note__main">
        <NoteDialogNoteComponents.Content {...props} />
      </main>
      {(isModerator || !boardLocked) && (
        <aside className="note-dialog-note__options">
          <NoteDialogNoteComponents.Options {...props} />
        </aside>
      )}
      <footer className="note-dialog-note__footer">
        <NoteDialogNoteComponents.Footer {...props} />
      </footer>
    </div>
  );
  /* eslint-enable jsx-a11y/no-static-element-interactions */
};
