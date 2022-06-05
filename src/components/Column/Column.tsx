import "./Column.scss";
import {Color, getColorClassName} from "constants/colors";
import {NoteInput} from "components/NoteInput";
import {useRef, useState} from "react";
import classNames from "classnames";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as CloseIcon, ReactComponent as AbortIcon} from "assets/icon-close.svg";
import {ReactComponent as SubmitIcon} from "assets/icon-check.svg";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
import {ReactComponent as DotsIcon} from "assets/icon-dots.svg";
import {TabIndex} from "constants/tabIndex";
import _ from "underscore";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {closestCenter, DndContext, DragEndEvent, MouseSensor, useDroppable, useSensor, useSensors, DragOverlay, DragStartEvent} from "@dnd-kit/core";
import {rectSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {Note as NoteType} from "types/note";
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
        .sort((a, b) => a.position.rank - b.position.rank) // Ascending: (a - b) | Descending: (a > b ? 1 : 1)
        .reverse(),
      showAuthors: applicationState.board.data!.showAuthors,
      moderating: applicationState.view.moderating,
      viewer: applicationState.participants!.self,
    }),
    _.isEqual
  );
  const isModerator = state.viewer.role === "OWNER" || state.viewer.role === "MODERATOR";
  const [columnNameMode, setColumnNameMode] = useState<"VIEW" | "EDIT">("VIEW");
  const [openedColumnSettings, setOpenedColumnSettings] = useState(false);
  const [dragActiveId, setDragActiveId] = useState("");

  const inputRef = useRef<HTMLInputElement>();
  const columnRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 125, // Mouse down delay before drag start (ms)
        tolerance: 10, // Tolerated mouse movement during delay (px)
      },
    })
  );

  const {isOver, setNodeRef} = useDroppable({
    id: "droppable",
  });

  /**
   * Converts between note rank and note index (which are reversed).
   *
   * @param n the total number of notes
   * @param i the note rank/index to be converted
   */
  // const reverseIndex = (n: number, i: number) => n - i - 1;

  /**
   * Moves a note inside the note list.
   */
  // const moveNoteItem = (arr: NoteType[], oldIndex: number, newIndex: number) => {
  //   if (newIndex >= arr.length) {
  //     let i = newIndex - arr.length + 1;
  //     while (i--) {
  //       arr.push({...arr[0]}); // Pad with placeholder
  //     }
  //   }
  //   arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
  //   return arr;
  // };

  // const onDragEnd = async (result: DropResult) => {
  //   const {destination, source, combine, draggableId} = result;
  //
  //   if (combine) {
  //     dispatch(Actions.updatedNotesOptimistically(state.notes.slice(source.index, 1)));
  //     dispatch(Actions.editNote(draggableId, {position: {column: combine.droppableId, stack: combine.draggableId, rank: 0}}));
  //   }
  //   if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
  //     return;
  //   }
  //   // Optimistically updates the local note list before persisting the change to prevent flickering
  //   dispatch(Actions.updatedNotesOptimistically(moveNoteItem(state.notes, source.index, destination.index)));
  //   dispatch(Actions.editNote(draggableId, {position: {column: destination.droppableId, stack: undefined, rank: reverseIndex(state.notes.length, destination.index)}}));
  // };

  const renderColumnName = () =>
    columnNameMode === "VIEW" ? (
      <h2 className={classNames("column__header-text", visible ? "column__header-text--visible" : "column__header-text--hidden")}>{name}</h2>
    ) : (
      <input
        tabIndex={tabIndex}
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
            tabIndex={tabIndex! + 1}
            title={t("Column.submitName")}
            className="column__header-edit-button"
            onClick={() => {
              dispatch(Actions.editColumn(id, {name: inputRef.current?.value ?? "", color, visible, index}));
              setColumnNameMode("VIEW");
            }}
          >
            <SubmitIcon className="column__header-edit-button-icon" />
          </button>
          <button tabIndex={tabIndex! + 2} title={t("Column.resetName")} className="column__header-edit-button" onClick={() => setColumnNameMode("VIEW")}>
            <AbortIcon className="column__header-edit-button-icon" />
          </button>
        </>
      )}
      <button tabIndex={tabIndex! + 3} title={t("Column.settings")} className="column__header-edit-button" onClick={() => setOpenedColumnSettings((o) => !o)}>
        {openedColumnSettings ? <CloseIcon className="column__header-edit-button-icon" /> : <DotsIcon className="column__header-edit-button-icon" />}
      </button>
    </>
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const {active, over} = e;

    if (over?.data?.current && active.id !== over.id) {
      dispatch(
        Actions.editNote(active.id.toString(), {
          position: {column: over.data.current.sortable.containerId, stack: over.id.toString(), rank: 0},
        })
      );
    }
    setDragActiveId("");
  };

  const handleDragStart = (e: DragStartEvent) => {
    setDragActiveId(e.active.id.toString());
  };

  const getNoteComponent = (note: NoteType, noteIndex: number) => (
    <Note
      showAuthors={state.showAuthors!}
      key={note.id}
      noteId={note.id}
      columnId={id}
      columnName={name}
      columnColor={color}
      columnVisible={visible}
      tabIndex={TabIndex.Note + (tabIndex! - TabIndex.Column) * TabIndex.Note + noteIndex * 3}
      moderating={state.moderating}
      viewer={state.viewer}
      noteIndex={noteIndex}
      dragActiveId={dragActiveId}
    />
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <section className={classNames("column", {"column__moderation-isActive": isModerator && state.moderating}, getColorClassName(color))} ref={columnRef}>
        <div className="column__content">
          <div className="column__header">
            <div className="column__header-title">
              {renderColumnName()}
              {columnNameMode === "VIEW" && <span className="column__header-card-number">{state.notes.length}</span>}
              {columnNameMode === "VIEW" && !visible && <HiddenIcon className="column__header-hidden-icon" title={t("Column.hiddenColumn")} />}
              {isModerator && renderColumnModifiers()}
              {openedColumnSettings && (
                <ColumnSettings
                  tabIndex={tabIndex! + 4}
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
          <SortableContext id={id} items={state.notes} strategy={rectSortingStrategy}>
            <div tabIndex={TabIndex.disabled} className={classNames("column__notes-wrapper")}>
              <ul ref={setNodeRef} className={classNames("column__note-list", {"column__note-list--isDraggedOver": isOver})}>
                {state.notes.map((note, noteIndex) => getNoteComponent(note, noteIndex))}
              </ul>
              <DragOverlay>{dragActiveId ? state.notes.filter((n) => n.id === dragActiveId).map((note, noteIndex) => getNoteComponent(note, noteIndex)) : null}</DragOverlay>
            </div>
          </SortableContext>
        </div>
      </section>
    </DndContext>
  );
};
