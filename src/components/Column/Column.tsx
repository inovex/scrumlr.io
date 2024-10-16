import "./Column.scss";
import {Color, getColorClassName} from "constants/colors";
import {NoteInput} from "components/NoteInput";
import {useEffect, useRef, useState} from "react";
import classNames from "classnames";
import {Tooltip} from "react-tooltip";
import {useAppDispatch, useAppSelector} from "store";
import {Close, MarkAsDone, Hidden, ThreeDots} from "components/Icon";
import _ from "underscore";
import {useTranslation} from "react-i18next";
import {hotkeyMap} from "constants/hotkeys";
import {Droppable} from "components/DragAndDrop/Droppable";
import {useStripeOffset} from "utils/hooks/useStripeOffset";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import {useEmojiAutocomplete} from "utils/hooks/useEmojiAutocomplete";
import {useTextOverflow} from "utils/hooks/useTextOverflow";
import {Note} from "../Note";
import {ColumnSettings} from "./ColumnSettings";
import {createColumn, deleteColumnOptimistically, editColumn, editColumnOptimistically} from "../../store/features";

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
  const dispatch = useAppDispatch();

  const {isTextTruncated, textRef} = useTextOverflow<HTMLHeadingElement>(name);

  const notes = useAppSelector(
    (state) =>
      state.notes
        ? state.notes
            .filter((note) => !note.position.stack)
            .filter((note) => (state.board.data?.showNotesOfOtherUsers || state.auth.user!.id === note.author) && note.position.column === id)
            .map((note) => note.id)
        : [],
    _.isEqual
  );
  const moderating = useAppSelector((state) => state.view.moderating);
  const viewer = useAppSelector((state) => state.participants!.self);

  const colorClassName = getColorClassName(color);
  const isModerator = viewer?.role === "OWNER" || viewer?.role === "MODERATOR";
  const {value: columnName, ...emoji} = useEmojiAutocomplete<HTMLDivElement>({maxInputLength: 32, initialValue: name});

  const [columnNameMode, setColumnNameMode] = useState<"VIEW" | "EDIT">("VIEW");
  const [openedColumnSettings, setOpenedColumnSettings] = useState(false);
  const [isTemporary, setIsTemporary] = useState(id === "TEMP_ID");

  const inputRef = useRef<HTMLInputElement>();
  const columnRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const toggleVisibilityHandler = () => {
    dispatch(
      editColumn({
        id,
        column: {
          name,
          color,
          index,
          visible: !visible,
        },
      })
    );
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
        dispatch(deleteColumnOptimistically(id));
      } else {
        dispatch(
          editColumnOptimistically({
            id,
            column: {
              name: newName,
              color,
              visible,
              index,
            },
          })
        ); // Prevents flicker when submitting a new column
        dispatch(createColumn({name: newName, color, visible, index}));
        setIsTemporary(false);
      }
    } else {
      dispatch(
        editColumn({
          id,
          column: {
            name: newName,
            color,
            visible,
            index,
          },
        })
      );
    }
    setColumnNameMode("VIEW");
  };

  const renderColumnName = () =>
    columnNameMode === "VIEW" ? (
      <div className={classNames("column__header-text-wrapper", {"column__header-text-wrapper--hidden": !visible})}>
        {!visible && <Hidden className="column__header-hidden-icon" title={t("Column.hiddenColumn")} onClick={toggleVisibilityHandler} />}
        <h2
          ref={textRef}
          id={`column-${id}`}
          onDoubleClick={() => {
            if (isModerator) {
              setColumnNameMode("EDIT");
            }
          }}
          className={classNames("column__header-text", {"column__header-text--hidden": !visible})}
        >
          {name}
        </h2>
        {isTextTruncated && (
          <Tooltip className="column__tooltip" anchorSelect={`#column-${id}`}>
            {name}
          </Tooltip>
        )}
      </div>
    ) : (
      <>
        <input
          {...emoji.inputBindings}
          className="column__header-input"
          type="text"
          onKeyDown={(e) => {
            emoji.inputBindings.onKeyDown(e);
            if (e.defaultPrevented) return;

            if (e.key === "Escape") {
              if (isTemporary) {
                dispatch(deleteColumnOptimistically(id));
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
          onBlur={(e) => {
            if (e.relatedTarget !== closeButtonRef.current) handleEditColumnName((e.target as HTMLInputElement).value);
          }}
        />
        <EmojiSuggestions {...emoji.suggestionsProps} />
      </>
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
          <MarkAsDone className="column__header-edit-button-icon" />
        </button>
      )}
      {columnNameMode === "EDIT" && (
        <button
          title={t("Column.resetName")}
          className="column__header-edit-button"
          ref={closeButtonRef}
          onClick={() => {
            if (isTemporary) {
              dispatch(deleteColumnOptimistically(id));
            }
            setColumnNameMode("VIEW");
          }}
          aria-label={t("Column.resetName")}
        >
          <Close className="column__header-edit-button-icon" />
        </button>
      )}
      {!isTemporary && !openedColumnSettings && (
        <button title={t("Column.settings")} className="column__header-edit-button" onClick={() => setOpenedColumnSettings((o) => !o)}>
          <ThreeDots className="column__header-edit-button-icon" style={{transform: "rotate(90deg)"}} /> {/* inline style to avoid funky rotating behaviour when hovering */}
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
          <div className="column__header-title" ref={emoji.containerRef}>
            {renderColumnName()}
            {columnNameMode === "VIEW" && notes.length > 0 && (
              <span className="column__header-card-number" title={t("Column.notes", {count: notes.length})}>
                {notes.length}
              </span>
            )}
            {!openedColumnSettings && isModerator && renderColumnModifiers()}
            {openedColumnSettings && (
              <ColumnSettings
                id={id}
                name={name}
                color={color}
                visible={visible}
                index={index}
                onClose={() => setOpenedColumnSettings(false)}
                onNameEdit={() => setColumnNameMode("EDIT")}
                setOpenColumnSet={setOpenedColumnSettings}
                closeColumnSettings={() => setOpenedColumnSettings(false)}
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
