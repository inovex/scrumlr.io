import "./Column.scss";
import {Color, getColorClassName} from "constants/colors";
import NoteInput from "components/NoteInput/NoteInput";
import React from "react";
import {useDrop} from "react-dnd";
import classNames from "classnames";

export interface ColumnProps {
  id: string;
  name: string;
  color: Color;
  children?: React.ReactNode;
}

const Column = ({id, name, color, children}: ColumnProps) => {
  const [{isOver}, drop] = useDrop(() => ({
    accept: "NOTE",
    drop: () => ({columnId: id}),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <section className={`column ${getColorClassName(color)}`}>
      <div className="column__content">
        <header className="column__header">
          <div className="column__header-title">
            <h2 className="column__header-text">{name}</h2>
            <span className="column__header-card-number">{React.Children.count(children)}</span>
          </div>
          <NoteInput columnId={id} />
        </header>
        <div className={classNames("column__notes-wrapper", {"column__notes-wrapper--isOver": isOver})} ref={drop}>
          <ul className="column__note-list">{children}</ul>
        </div>
      </div>
    </section>
  );
};
export default Column;
