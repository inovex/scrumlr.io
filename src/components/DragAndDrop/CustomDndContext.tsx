import {
  Active,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MouseSensor,
  rectIntersection,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {Note} from "components/Note";
import {getColorClassName} from "constants/colors";
import {ReactNode, useState} from "react";
import {createPortal} from "react-dom";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {Column} from "types/column";

type CustomDndContextProps = {
  children: ReactNode;
};

export const CustomDndContext = ({children}: CustomDndContextProps) => {
  const [active, setActive] = useState<null | Active>(null);

  const {self, columns, notes} = useAppSelector((state) => ({self: state.participants?.self, columns: state.columns, notes: state.notes}));

  const sensors = useSensors(useSensor(MouseSensor, {activationConstraint: {distance: 2}}), useSensor(TouchSensor));
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const getColumn = (id?: UniqueIdentifier): Column | undefined => {
    if (!id) return undefined;
    const note = notes.find((n) => n.id === id);
    if (note) return columns.find((column) => column.id === note.position.column);
    return columns.find((column) => column.id === id);
  };

  const onDragStart = (event: DragStartEvent) => {
    setActive(event.active);
  };
  const onDragOver = (event: DragOverEvent) => {
    if (!event.over) return;

    // const col = getColumn(event.over.id);
    // console.log(col?.name);
  };

  const onDragEnd = (event: DragEndEvent) => {
    if (!event.over || !active) return;

    const column = getColumn(event.over.id);
    if (!column || column.id === notes.find((note) => note.id === active.id)?.position.column) return;
    store.dispatch(Actions.editNote(active.id.toString(), {position: {column: column.id, stack: undefined, rank: 0}}));
  };

  const activeColumnColor = getColumn(active?.id)?.color;
  let colorClassName: string | undefined;
  if (activeColumnColor) colorClassName = getColorClassName(activeColumnColor);

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} collisionDetection={rectIntersection}>
      {children}
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation} className={colorClassName}>
          {active?.id && self ? <Note noteId={active.id.toString()} viewer={self} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
