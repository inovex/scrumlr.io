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
  const [maxCollision, setMaxCollision] = useState<null | Collision>(null);
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
  const onDragOver = (event: DragOverEvent) => {
    setMaxCollision(event.collisions?.[0] ?? null);
  };

  const onDragEnd = ({over, collisions, active}: DragEndEvent) => {};

  const collisionDetectionWrapper =
    (collisionDetection: CollisionDetection) =>
    (...[args]: Parameters<typeof collisionDetection>) => {
      const collisions = collisionDetection(args);
      // only reorder if intersectionRatio is above threshold, otherwise move last collision to top
      // the first collision will be used as over id
      // if the over id changes, the active draggable will be moved there
      if (collisions?.[0]?.data?.value < MOVE_THRESHOLD && maxCollision) {
        const lastCollisionId = maxCollision?.id;
        const index = collisions.findIndex((collision) => collision.id === lastCollisionId);
        collisions.unshift(...collisions.splice(index, 1));
      }

      return collisions;
    };

  return (
    // eslint-disable-next-line max-len
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} collisionDetection={collisionDetectionWrapper(rectIntersection)}>
      {children}
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation} className={dragActive?.colorClassName}>
          {dragActive?.id && self ? <Note noteId={dragActive.id.toString()} viewer={self} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
