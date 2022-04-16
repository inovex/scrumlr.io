import "./Column.scss";
import {Color, getColorClassName} from "constants/colors";
import {NoteInput} from "components/NoteInput";
import {useRef, useState} from "react";
import {useDrop} from "react-dnd";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as CloseIcon, ReactComponent as AbortIcon} from "assets/icon-close.svg";
import {ReactComponent as SubmitIcon} from "assets/icon-check.svg";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as DotsIcon} from "assets/icon-dots.svg";
import {TabIndex} from "constants/tabIndex";
import _ from "underscore";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {Note} from "../Note";
import {ColumnSettings} from "./ColumnSettings";

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
  const {t} = useTranslation();
  const dispatch = useDispatch();

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
  const isModerator = state.viewer.role === "OWNER" || state.viewer.role === "MODERATOR";
  const [columnNameMode, setColumnNameMode] = useState<"VIEW" | "EDIT">("VIEW");
  const [openedColumnSettings, setOpenedColumnSettings] = useState(false);

  const inputRef = useRef<HTMLInputElement>();
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

  // const Icon = visible ? visibleIcon : hiddenIcon;

  const renderColumnName = () =>
    columnNameMode === "VIEW" ? (
      <h2 className="column__header-text">{name}</h2>
    ) : (
      <input
        maxLength={32}
        className="column__header-input"
        defaultValue={name}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setColumnNameMode("VIEW");
          } else if (e.key === "Enter") {
            setColumnNameMode("VIEW");
            dispatch(Actions.editColumn(id, {name: (e.target as HTMLInputElement).value, color, visible, index}));
          }
        }}
        ref={(ref) => {
          ref?.focus();
          inputRef.current = ref!;
        }}
        onFocus={(e) => e.target.select()}
      />
    );

  const renderColumnModifiers = () => (
    <>
      {columnNameMode === "EDIT" && (
        <>
          <button
            tabIndex={TabIndex.disabled}
            title={t("Column.submitName")}
            className="column__header-edit-button"
            onClick={() => {
              dispatch(Actions.editColumn(id, {name: inputRef.current?.value ?? "", color, visible, index}));
              setColumnNameMode("VIEW");
            }}
          >
            <SubmitIcon className="column__header-edit-button-icon" />
          </button>
          <button tabIndex={TabIndex.disabled} title={t("Column.resetName")} className="column__header-edit-button" onClick={() => setColumnNameMode("VIEW")}>
            <AbortIcon className="column__header-edit-button-icon" />
          </button>
        </>
      )}
      <button title={t("Column.settings")} className="column__header-edit-button" onClick={() => setOpenedColumnSettings((o) => !o)}>
        {openedColumnSettings ? <CloseIcon className="column__header-edit-button-icon" /> : <DotsIcon className="column__header-edit-button-icon" />}
      </button>
    </>
  );

  return (
    <section className={`column ${getColorClassName(color)}`} ref={columnRef}>
      <div className="column__content">
        <div className="column__header">
          <div className="column__header-title">
            {renderColumnName()}
            {columnNameMode === "VIEW" && <span className="column__header-card-number">{state.notes.length}</span>}
            {columnNameMode === "VIEW" && !visible && <HiddenIcon className="column__header-hidden-icon" title={t("Column.hiddenColumn")} />}
            {isModerator && renderColumnModifiers()}
            {openedColumnSettings && (
              <ColumnSettings
                id={id}
                name={name}
                color={color}
                visible={visible}
                index={index}
                onClose={() => setOpenedColumnSettings(false)}
                onNameEdit={() => setColumnNameMode("EDIT")}
              />
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
