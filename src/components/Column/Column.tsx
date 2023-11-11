import "./Column.scss";
import {Color, getColorClassName} from "constants/colors";
import {NoteInput} from "components/NoteInput";
import {useEffect, useRef, useState} from "react";
import classNames from "classnames";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ReactComponent as SubmitIcon} from "assets/icon-check.svg";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as DotsIcon} from "assets/icon-dots.svg";
import _ from "underscore";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {hotkeyMap} from "constants/hotkeys";
import {Droppable} from "components/DragAndDrop/Droppable";
import {useStripeOffset} from "utils/hooks/useStripeOffset";
import {Note} from "../Note";
import {ColumnSettings} from "./ColumnSettings";

const {SELECT_NOTE_INPUT_FIRST_KEY} = hotkeyMap;

export interface ColumnProps {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
}

export const Column = ({id, name, color, visible, index}: ColumnProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const notes = useAppSelector(
    (state) =>
      state.notes
        .filter((note) => !note.position.stack)
        .filter((note) => (state.board.data?.showNotesOfOtherUsers || state.auth.user!.id === note.author) && note.position.column === id)
        .map((note) => note.id),
    _.isEqual
  );
  const moderating = useAppSelector((state) => state.view.moderating, _.isEqual);
  const viewer = useAppSelector((state) => state.participants!.self, _.isEqual);

  const colorClassName = getColorClassName(color);
  const isModerator = viewer.role === "OWNER" || viewer.role === "MODERATOR";
  const [columnName, setColumnName] = useState(name);
  const [columnNameMode, setColumnNameMode] = useState<"VIEW" | "EDIT">("VIEW");
  const [openedColumnSettings, setOpenedColumnSettings] = useState(false);
  const [isTemporary, setIsTemporary] = useState(id === "TEMP_ID");

  const inputRef = useRef<HTMLInputElement>();
  const columnRef = useRef<HTMLElement | null>(null);

  const toggleVisibilityHandler = () => {
    dispatch(Actions.editColumn(id, {name, color, index, visible: !visible}));
  };

  const [localNotes, setLocalNotes] = useState(notes);
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const setItems = (items: string[]) => {
    setLocalNotes(items);
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
          aria-label={t("Column.submitName")}
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
          aria-label={t("Column.resetName")}
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

  const {
    bindings: {ref: stripeRef, style: stripeStyle},
    updateOffset,
  } = useStripeOffset({gradientLength: 40, gradientAngle: 45});

  const columnCount = useAppSelector((state) => state.columns.length);

  useEffect(() => {
    updateOffset();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnCount]);

  return (
    <section
      className={classNames("column", {"column--hidden": !visible}, {"column__moderation-isActive": isModerator && moderating}, colorClassName)}
      style={stripeStyle}
      ref={(r) => {
        columnRef.current = r;
        stripeRef.current = r;
      }}
    >
      <div className="column__content">
        <div className="column__header">
          <div className="column__header-title">
            {renderColumnName()}
            {columnNameMode === "VIEW" && notes.length > 0 && (
              <span className="column__header-card-number" title={t("Column.notes", {count: notes.length})}>
                {notes.length}
              </span>
            )}
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
            columnIsVisible={visible}
            toggleColumnVisibility={toggleVisibilityHandler}
            hotkeyKey={`${SELECT_NOTE_INPUT_FIRST_KEY.map((key, i) => (i === 0 ? `${key.toUpperCase()}/` : key.toUpperCase())).join("")} + ${index + 1}`}
          />
        </div>
        <Droppable id={id} items={localNotes} setItems={setItems} globalNotes={notes} className="column__notes-wrapper">
          <ul className="column__note-list">
            {localNotes.map((note) => (
              <li key={note}>
                <Note setItems={setItems} noteId={note} viewer={viewer} colorClassName={colorClassName} />
              </li>
            ))}
          </ul>
        </Droppable>
      </div>
    </section>
  );
};
