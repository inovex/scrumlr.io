import {
  Collision,
  CollisionDetection,
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
import classNames from "classnames";
import {Note} from "components/Note";
import {getColorClassName} from "constants/colors";
import {MOVE_THRESHOLD} from "constants/misc";
import {ReactNode, useState} from "react";
import {createPortal} from "react-dom";
import {useAppSelector} from "store";
import {Column} from "types/column";

type CustomDndContextProps = {
  children: ReactNode;
};

export const CustomDndContext = ({children}: CustomDndContextProps) => {
  const [maxCollision, setMaxCollision] = useState<Collision | undefined>();
  const [dragActive, setDragActive] = useState<{id: string; colorClassName: string} | undefined>();

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

  const isNote = (collision: Collision) => collision.data?.droppableContainer.data.current.type === "note";
  const getColumn = (id?: UniqueIdentifier): Column | undefined => {
    if (!id) return undefined;
    const note = notes.find((n) => n.id === id);
    if (note) return columns.find((column) => column.id === note.position.column);
    return columns.find((column) => column.id === id);
  };

  const onDragStart = ({active}: DragStartEvent) => {
    if (!active) return;
    const activeColumnColor = getColumn(active.id)?.color;
    if (!activeColumnColor) return;
    setDragActive({id: active.id.toString(), colorClassName: getColorClassName(activeColumnColor)});
  };

  const onDragOver = ({collisions}: DragOverEvent) => {
    const overCollision = collisions?.at(0);
    if (!overCollision) return;
    if (isNote(overCollision)) setMaxCollision(overCollision);
  };

  const onDragEnd = ({over, collisions, active}: DragEndEvent) => {};

  const collisionDetectionWrapper =
    (collisionDetection: CollisionDetection) =>
    (...[args]: Parameters<typeof collisionDetection>) => {
      const collisions = collisionDetection(args);

      const overCollision = collisions.at(0);
      // if highest collision ratio is below threshold, place previous collision in front
      if (maxCollision && overCollision && isNote(overCollision) && overCollision.data?.value < MOVE_THRESHOLD) {
        // find last maxCollision in collisions
        const lastOver = collisions.findIndex((collision) => collision.id === maxCollision?.id);
        if (lastOver === -1) collisions.unshift({...maxCollision, data: {...maxCollision.data, value: 0}});
        else collisions.unshift(...collisions.splice(lastOver, 1));
      }

      return collisions;
    };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} collisionDetection={collisionDetectionWrapper(rectIntersection)}>
      {children}
      {createPortal(
        <DragOverlay zIndex={100} dropAnimation={dropAnimation} className={classNames("drag-overlay", dragActive?.colorClassName)}>
          {dragActive?.id && self ? <Note noteId={dragActive.id.toString()} viewer={self} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
