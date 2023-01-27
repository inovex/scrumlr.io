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
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {Note} from "components/Note";
import {ReactNode, useState} from "react";
import {createPortal} from "react-dom";
import {useAppSelector} from "store";

type CustomDndContextProps = {
  children: ReactNode;
};

export const CustomDndContext = ({children}: CustomDndContextProps) => {
  const [active, setActive] = useState<null | Active>(null);
  const self = useAppSelector((state) => state.participants?.self);
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

  const onDragStart = (event: DragStartEvent) => {
    setActive(event.active);
    console.log("onDragStart");
  };
  const onDragOver = ({active, over}: DragOverEvent) => {
    console.log("onDragOver");
  };

  const onDragEnd = ({active, over}: DragEndEvent) => {
    console.log("onDragEnd");
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
