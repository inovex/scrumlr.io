import "./Column.scss";
import {Color, getColorClassName} from "constants/colors";
import {NoteInput} from "components/NoteInput";
import {useRef} from "react";
import {useDrop} from "react-dnd";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as visibleIcon} from "assets/icon-visible.svg";
import {ReactComponent as hiddenIcon} from "assets/icon-hidden.svg";
import {TabIndex} from "constants/tabIndex";
import _ from "underscore";
import {Note} from "../Note";

const MAX_NOTE_LENGTH = 1024;

export interface ColumnProps {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  tabIndex?: number;
}

export const Column = ({id, name, color, visible, index, tabIndex}: ColumnProps) => {
  const state = useAppSelector(
    (applicationState) => ({
      notes: applicationState.notes
        .filter((note) => !note.position.stack)
        .filter((note) => (applicationState.board.data?.showNotesOfOtherUsers || applicationState.auth.user!.id === note.author) && note.position.column === id)
        .map((note) => note.id),
      showAuthors: applicationState.board.data!.showAuthors,
      moderating: applicationState.view.moderating,
      viewer: applicationState.participants!.self,
    }),
    _.isEqual
  );

  const columnRef = useRef<HTMLDivElement>(null);
  const [{isOver, canDrop}, drop] = useDrop(() => ({
    accept: ["NOTE", "STACK"],
    drop: (item: {id: string; columnId: string}, monitor) => {
      if (item.columnId !== id && !monitor.didDrop()) {
        store.dispatch(Actions.editNote(item.id, {position: {column: id, stack: undefined, rank: 0}}));
      }
    },
    collect: (monitor) => ({isOver: monitor.isOver(), canDrop: monitor.canDrop()}),
    canDrop: (item: {id: string; columnId: string}) => item.columnId !== id,
  }));

  if (columnRef.current && isOver) {
    const rect = columnRef.current.getBoundingClientRect();
    if (rect.left <= 0 || rect.right >= document.documentElement.clientWidth) {
      columnRef.current.scrollIntoView({inline: "start", behavior: "smooth"});
    }
  }

  const Icon = visible ? visibleIcon : hiddenIcon;

  return (
    <section className={`column ${getColorClassName(color)}`} ref={columnRef}>
      <div className="column__content">
        <div className="column__header">
          <div className="column__header-title">
            <h2 className="column__header-text">{name}</h2>
            <span className="column__header-card-number">{state.notes.length}</span>
            {(state.viewer.role === "OWNER" || state.viewer.role === "MODERATOR") && (
              <div className="column__header-toggle">
                <button
                  tabIndex={TabIndex.disabled}
                  className="column__header-toggle-button"
                  onClick={() => store.dispatch(Actions.editColumn(id, {name, color, index, visible: !visible}))}
                >
                  <Icon className="column__header-toggle-button-icon" />
                </button>
              </div>
            )}
          </div>
          <NoteInput columnId={id} tabIndex={tabIndex} maxNoteLength={MAX_NOTE_LENGTH} />
        </div>
        <div tabIndex={TabIndex.disabled} className={classNames("column__notes-wrapper", {"column__notes-wrapper--isOver": isOver && canDrop})} ref={drop}>
          <ul className="column__note-list">
            {state.notes.map((note, noteIndex) => (
              <Note
                showAuthors={state.showAuthors!}
                key={note}
                noteId={note}
                columnId={id}
                columnName={name}
                columnColor={color}
                tabIndex={TabIndex.Note + (tabIndex! - TabIndex.Column) * TabIndex.Note + noteIndex * 3}
                moderating={state.moderating}
                viewer={state.viewer}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
