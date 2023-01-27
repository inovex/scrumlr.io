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
  Over,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {Note} from "components/Note";
import {ReactNode, useState} from "react";
import {createPortal} from "react-dom";
import {useAppSelector} from "store";
import {Column} from "types/column";

type CustomDndContextProps = {
  children: ReactNode;
};

export type SortableType = "column" | "note";
export type SortableMode = "drag" | "drop" | "both";

export const CustomDndContext = ({children}: CustomDndContextProps) => {
  const [active, setActive] = useState<null | Active>(null);

  const {self, columns, notes} = useAppSelector((state) => ({self: state.participants?.self, columns: state.columns, notes: state.notes}));

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const findCurrentColumn = (over: Over): Column | undefined => {
    const type = over.data.current?.type;
    switch (type) {
      case "note": {
        const note = notes.find((n) => n.id === over.id);
        return note ? columns.find((column) => column.id === note.position.column) : undefined;
      }
      case "column": {
        return columns.find((column) => column.id === over.id);
      }
      default:
        return undefined;
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    setActive(event.active);
  };
  const onDragOver = (event: DragOverEvent) => {
    if (event.over) {
      const col = findCurrentColumn(event.over);
      console.log(col?.name);
    }
  };
  const onDragEnd = (event: DragEndEvent) => {
    setActive(null);
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
      {children}
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation} className={active?.data.current?.accentColor}>
          {active?.id && self ? <Note noteId={active.id.toString()} viewer={self} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
