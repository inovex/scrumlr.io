import "./Column.scss";
import {Color, getColorClassName} from "constants/colors";
import NoteInput from "components/NoteInput/NoteInput";
import React, {useRef} from "react";
import {useDrop} from "react-dnd";
import classNames from "classnames";

export interface ColumnProps {
  id: string;
  name: string;
  color: Color;
  children?: React.ReactNode;
}

const Column = ({id, name, color, children}: ColumnProps) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const [{isOver, canDrop}, drop] = useDrop(() => ({
    accept: "NOTE",
    drop: () => ({type: "COLUMN", id}),
    collect: (monitor) => ({isOver: monitor.isOver(), canDrop: monitor.canDrop()}),
    canDrop: (item: {id: string; columnId: string}) => item.columnId !== id,
  }));

  if (columnRef.current && isOver) {
    const rect = columnRef.current.getBoundingClientRect();
    if (rect.left <= 0 || rect.right >= document.documentElement.clientWidth) {
      columnRef.current.scrollIntoView({inline: "start", behavior: "smooth"});
    }
  }

  return (
    <section className={`column ${getColorClassName(color)}`} ref={columnRef}>
      <div className="column__content">
        <header className="column__header">
          <div className="column__header-title">
            <h2 className="column__header-text">{name}</h2>
            <span className="column__header-card-number">{React.Children.count(children)}</span>
          </div>
          <NoteInput columnId={id} />
        </header>
        <div className={classNames("column__notes-wrapper", {"column__notes-wrapper--isOver": isOver && canDrop})} ref={drop}>
          <ul className="column__note-list">{children}</ul>
        </div>
      </div>
    </section>
  );
};
export default Column;
