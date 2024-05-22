import classNames from "classnames";
import {ReactNode, useEffect, useState} from "react";
import "./NoteDialogNoteWrapper.scss";

type NoteDialogNoteWrapperProps = {
  children: ReactNode;
  dimensions?: DOMRect;
};

export const NoteDialogNoteWrapper = (props: NoteDialogNoteWrapperProps) => {
  const [height, setHeight] = useState(0);

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
  }, [props.children]);

  // this sets the height of the scrollbar container to be same as the parent note, because I couldn't get it to work just using CSS
  useEffect(() => {
    let newHeight = props.dimensions ? props.dimensions.height : 0;
    newHeight += 2 * 16; // add paddings manually // TODO get computed style or find better solution
    setHeight(newHeight);
  }, [props.dimensions]);

  return (
    <div className={classNames("note-dialog__scrollbar")} style={{height: `${height}px`}}>
      <div className={classNames("note-dialog__note-wrapper")}>{props.children}</div>
    </div>
  );
};
