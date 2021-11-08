import classNames from "classnames";
import {FC, useEffect} from "react";
import "./NoteDialogNoteWrapper.scss";

type NoteDialogNoteWrapperProps = Record<string, never>;

export const NoteDialogNoteWrapper: FC<NoteDialogNoteWrapperProps> = ({children}) => {
  const handleScroll = (scrollbar: Element) => {
    const notes = scrollbar.querySelectorAll(".note-dialog__note");
    const scrollbarHeight = scrollbar.clientHeight;
    notes.forEach((note) => {
      // Top is the div which contains all the notes (.note-dialog__scrollbar)
      const distanceToTop = note.getBoundingClientRect().top - scrollbar.getBoundingClientRect().top;
      const noteHeight = note.scrollHeight;

      let opacity = 1;
      // Note comes from the top and scrolls in the view (only the lower part is visible)
      if (distanceToTop < 0) {
        opacity = (noteHeight + distanceToTop) / noteHeight;
      }

      // Is the complete note visible or only the upper part?
      const remainingSpace = scrollbarHeight - (distanceToTop + noteHeight);

      if (remainingSpace < 0) {
        opacity = (scrollbarHeight - distanceToTop) / noteHeight;
      }

      // If the card is bigger than our NoteDialog (we don't want to have opacity effects here)
      if (distanceToTop < 0 && remainingSpace <= 0) {
        opacity = 1;
      }

      if (opacity >= 0) {
        (note as HTMLElement).style.opacity = opacity.toString();
      }
    });
  };

  useEffect(() => {
    const scrollbar = document.querySelector(".note-dialog__scrollbar")!;
    scrollbar.addEventListener("scroll", () => handleScroll(scrollbar));
  }, [children]);
  return (
    <div className={classNames("note-dialog__scrollbar")}>
      <div className={classNames("note-dialog__note-wrapper")}>{children}</div>
    </div>
  );
};
