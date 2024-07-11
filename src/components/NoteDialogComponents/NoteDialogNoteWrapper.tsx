import {FC, PropsWithChildren, useEffect, useRef} from "react";
import "./NoteDialogNoteWrapper.scss";

export const NoteDialogNoteWrapper: FC<PropsWithChildren> = ({children}) => {
  const scrollContainer = useRef<HTMLDivElement>(null);

  // display notes within full view with full opacity.
  // the more it goes out of the view (i.e. intersectionRatio), the less opaque it becomes
  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return () => {};

    const notes = container.querySelectorAll(".note-dialog__note");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const note = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            const {intersectionRatio} = entry;
            note.style.opacity = intersectionRatio.toString();
          } else {
            note.style.opacity = "0";
          }
        });
      },
      {
        root: container,
        threshold: Array.from({length: 101}, (_, i) => i / 100), // 0.00, 0.01, ..., 1.00
      }
    );

    notes.forEach((note) => observer.observe(note));

    return () => {
      notes.forEach((note) => observer.unobserve(note));
    };
  }, [children]);

  return (
    <div className="note-dialog__scrollbar">
      <div className="note-dialog__inner-scrollbar" ref={scrollContainer}>
        <div className="note-dialog__note-wrapper">{children}</div>
      </div>
    </div>
  );
};
