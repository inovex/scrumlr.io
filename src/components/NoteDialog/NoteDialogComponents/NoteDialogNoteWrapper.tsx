import classNames from "classnames";
import {FC, useEffect} from "react";
import "./NoteDialogNoteWrapper.scss";

type NoteDialogNoteWrapperProps = {};

export const NoteDialogNoteWrapper: FC<NoteDialogNoteWrapperProps> = ({children}) => {
  const handleScroll = (scrollbar: Element) => {
    const notes = scrollbar.querySelectorAll(".note-dialog__note");
    const scrollbarHeight = scrollbar.clientHeight;
    notes.forEach((note) => {
      const distanceToTop = note.getBoundingClientRect().top - scrollbar.getBoundingClientRect().top;
      const noteHeight = note.scrollHeight;

      let opacity = 1;
      if (distanceToTop < 0) {
        opacity = (noteHeight + distanceToTop) / noteHeight;
      }
      if (scrollbarHeight - (distanceToTop + noteHeight) < 0) {
        opacity = (scrollbarHeight - distanceToTop) / noteHeight;
      }

      if (opacity >= 0) {
        (note as HTMLElement).style.opacity = opacity.toString();
      }
    });
  };

  useEffect(() => {
    const scrollbar = document.querySelector(".note-dialog__scrollbar")!;
    scrollbar.removeEventListener("scroll", (e) => handleScroll(scrollbar));
    scrollbar.addEventListener("scroll", (e) => handleScroll(scrollbar));
  }, [children]);
  return (
    <div className={classNames("note-dialog__scrollbar")}>
      <div className={classNames("note-dialog__note-wrapper")}>{children}</div>
    </div>
  );
};
