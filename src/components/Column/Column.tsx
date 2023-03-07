import "./Column.scss";
import {Color, getColorClassName} from "constants/colors";
import {NoteInput} from "components/NoteInput";
import {useEffect, useRef, useState} from "react";
import {useDrop} from "react-dnd";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ReactComponent as SubmitIcon} from "assets/icon-check.svg";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as DotsIcon} from "assets/icon-dots.svg";
import _ from "underscore";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {hotkeyMap} from "constants/hotkeys";
import {Note} from "../Note";
import {ColumnSettings} from "./ColumnSettings";

const MAX_NOTE_LENGTH = 1024;
const {SELECT_NOTE_INPUT_FIRST_KEY} = hotkeyMap;

export interface ColumnProps {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  isFirst?: boolean;
  isLast?: boolean;
}

export const Column = ({id, name, color, visible, index, isFirst, isLast}: ColumnProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const state = useAppSelector(
    (applicationState) => ({
      notes: applicationState.notes
        .filter((note) => !note.position.stack)
        .filter((note) => (applicationState.board.data?.showNotesOfOtherUsers || applicationState.auth.user!.id === note.author) && note.position.column === id)
        .map((note) => note.id),
      moderating: applicationState.view.moderating,
      viewer: applicationState.participants!.self,
    }),
    _.isEqual
  );
  const isModerator = state.viewer.role === "OWNER" || state.viewer.role === "MODERATOR";
  const [columnName, setColumnName] = useState(name);
  const [columnNameMode, setColumnNameMode] = useState<"VIEW" | "EDIT">("VIEW");
  const [openedColumnSettings, setOpenedColumnSettings] = useState(false);
  const [isTemporary, setIsTemporary] = useState(id === "TEMP_ID");

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

  const toggleVisibilityHandler = () => {
    dispatch(Actions.editColumn(id, {name, color, index, visible: !visible}));
  };

  useEffect(() => {
    if (isTemporary) {
      setColumnNameMode("EDIT");
      columnRef?.current?.scrollIntoView({inline: "start", behavior: "smooth"});
    }
  }, [isTemporary]);

  const handleEditColumnName = (newName: string) => {
    if (isTemporary) {
      if (!newName) {
        dispatch(Actions.deleteColumnOptimistically(id));
      } else {
        dispatch(Actions.editColumnOptimistically(id, {name: newName, color, visible, index})); // Prevents flicker when submitting a new column
        dispatch(Actions.createColumn({name: newName, color, visible, index}));
        setIsTemporary(false);
      }
    } else {
      dispatch(Actions.editColumn(id, {name: newName, color, visible, index}));
    }
    setColumnNameMode("VIEW");
  };

  const renderColumnName = () =>
    columnNameMode === "VIEW" ? (
      <div className={classNames("column__header-text-wrapper", {"column__header-text-wrapper--hidden": !visible})}>
        {!visible && <HiddenIcon className="column__header-hidden-icon" title={t("Column.hiddenColumn")} onClick={toggleVisibilityHandler} />}
        <h2
          onDoubleClick={() => {
            if (isModerator) {
              setColumnNameMode("EDIT");
            }
          }}
          className={classNames("column__header-text", {"column__header-text--hidden": !visible})}
        >
          {name}
        </h2>
      </div>
    ) : (
      <input
        maxLength={32}
        className="column__header-input"
        defaultValue={name}
        onChange={() => setColumnName(inputRef.current?.value ?? "")}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (isTemporary) {
              dispatch(Actions.deleteColumnOptimistically(id));
            }
            setColumnNameMode("VIEW");
          } else if (e.key === "Enter") {
            handleEditColumnName((e.target as HTMLInputElement).value);
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
      {columnNameMode === "EDIT" && columnName && (
        <button
          title={t("Column.submitName")}
          className="column__header-edit-button"
          onClick={() => {
            handleEditColumnName(inputRef.current?.value ?? "");
          }}
        >
          <SubmitIcon className="column__header-edit-button-icon" />
        </button>
      )}
      {columnNameMode === "EDIT" && (
        <button
          title={t("Column.resetName")}
          className="column__header-edit-button"
          onClick={() => {
            if (isTemporary) {
              dispatch(Actions.deleteColumnOptimistically(id));
            }
            setColumnNameMode("VIEW");
          }}
        >
          <CloseIcon className="column__header-edit-button-icon" />
        </button>
      )}
      {!isTemporary && (
        <button title={t("Column.settings")} className="column__header-edit-button" onClick={() => setOpenedColumnSettings((o) => !o)}>
          {openedColumnSettings ? <CloseIcon className="column__header-edit-button-icon" /> : <DotsIcon className="column__header-edit-button-icon" />}
        </button>
      )}
    </>
  );

  return (
    <section
      className={classNames(
        "column",
        {"column--hidden": !visible},
        {"column--first": isFirst},
        {"column--last": isLast},
        {"column__moderation-isActive": isModerator && state.moderating},
        getColorClassName(color)
      )}
      ref={columnRef}
    >
      <div className="column__content">
        <div className="column__header">
          <div className="column__header-title">
            {renderColumnName()}
            {columnNameMode === "VIEW" && <span className="column__header-card-number">{state.notes.length}</span>}
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
          <NoteInput
            columnIndex={index}
            columnId={id}
            maxNoteLength={MAX_NOTE_LENGTH}
            columnIsVisible={visible}
            toggleColumnVisibility={toggleVisibilityHandler}
            hotkeyKey={`${SELECT_NOTE_INPUT_FIRST_KEY.map((key, i) => (i === 0 ? `${key.toUpperCase()}/` : key.toUpperCase())).join("")} + ${index + 1}`}
          />
        </div>
        <div className={classNames("column__notes-wrapper", {"column__notes-wrapper--isOver": isOver && canDrop})} ref={drop}>
          <ul className="column__note-list">
            {state.notes.map((note) => (
              <li key={note}>
                <Note noteId={note} viewer={state.viewer} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
