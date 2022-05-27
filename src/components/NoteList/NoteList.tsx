import "./NoteList.scss";
import React from "react";
import classNames from "classnames";

interface NoteListProps {
  innerRef: (element: HTMLElement | null) => unknown;
  children: React.ReactNode;
  isDraggingOver: boolean;
}

export const NoteList = (props: NoteListProps) => (
  <ul ref={props.innerRef} className={classNames("note-list", {"note-list--isDraggedOver": props.isDraggingOver})}>
    {props.children}
  </ul>
);
