import {Active, Collision, UniqueIdentifier, useDndContext, useDndMonitor} from "@dnd-kit/core";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import classNames from "classnames";
import {COMBINE_THRESHOLD, MOVE_THRESHOLD} from "constants/misc";
import {ReactNode} from "react";
import store from "store";
import {Actions} from "store/action";

type SortableProps = {
  id: UniqueIdentifier;
  columnId?: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

const isColumn = (collision: Collision) => collision.data?.droppableContainer.data.current.type === "column";
const isActive = (id: UniqueIdentifier, active: Active | null) => id === active?.id;

export const shouldCombine = (id: UniqueIdentifier, items: UniqueIdentifier[], newIndex: number, collisions: Collision[] | null, active: Active | null) => {
  const newId = items?.[newIndex];
  const noteCollisions = collisions?.filter((collision) => !isColumn(collision));
  const maxNoteCollision = noteCollisions?.at(noteCollisions.length > 1 ? 1 : 0);

  if (!maxNoteCollision) return false;
  const collisionRatio = maxNoteCollision.data?.value;

  return maxNoteCollision?.id === newId && !isActive(id, active) && collisionRatio && collisionRatio >= COMBINE_THRESHOLD && collisionRatio < MOVE_THRESHOLD;
};

export const shouldStack = (id: UniqueIdentifier, items: UniqueIdentifier[], newIndex: number, collisions: Collision[] | null, active: Active | null) => {
  if (id !== active?.id) return false;
  if (items?.[newIndex] !== active.id) return false;
  const noteCollisions = collisions?.filter((collision) => !isColumn(collision));
  const maxNoteCollision = noteCollisions?.at(noteCollisions.length > 1 ? 1 : 0);

  if (!maxNoteCollision) return false;

  const collisionRatio = maxNoteCollision.data?.value;
  console.log(maxNoteCollision.id, collisionRatio);
  console.log(newIndex, items?.[newIndex], active.id);

  return collisionRatio && collisionRatio >= COMBINE_THRESHOLD && collisionRatio < MOVE_THRESHOLD;
};

export const Sortable = ({id, children, disabled, className, columnId}: SortableProps) => {
  const {collisions} = useDndContext();
  const {setNodeRef, attributes, listeners, transition, transform, isDragging, items, newIndex, active} = useSortable({
    id,
    data: {columnId, type: "note"},
    disabled,
  });

  const combine = shouldCombine(id, items, newIndex, collisions, active);

  const topCollision = collisions?.at(0);
  const hasActive = !!active && items.includes(active.id.toString());
  const hasOver = !!topCollision && items.includes(topCollision.id.toString());

  useDndMonitor({
    onDragEnd: () => {
      console.log(items);
      if (!columnId || !active) return;

      /*  if (combine) {
        // combine notes
        console.log("STACKING");
        store.dispatch(Actions.editNote(active.id.toString(), {position: {stack: id.toString(), column: columnId, rank: 0}}));
        return;
      } */

      if (shouldStack(id, items, newIndex, collisions, active)) {
        // combine notes
        const noteCollisions = collisions?.filter((collision) => !isColumn(collision));
        const maxNoteCollision = noteCollisions?.at(noteCollisions.length > 1 ? 1 : 0);
        if (!maxNoteCollision) return;
        console.log("STACKING");
        // BUG: colmn should be columnId of maxNoteCollision
        store.dispatch(Actions.editNote(active.id.toString(), {position: {stack: maxNoteCollision.id.toString(), column: columnId, rank: 0}}));
        return;
      }

      console.log("isActive", isActive(id, active));
      if (!isActive(id, active)) return;

      if (collisions && topCollision) {
        if (isColumn(topCollision)) {
          console.log("MOVE TO COLUMN 1");
          // BUG: rank: 0 is not correct
          store.dispatch(Actions.editNote(active.id.toString(), {position: {column: topCollision.id.toString(), stack: null, rank: 0}}));
          return;
        }
        if (active.id === topCollision.id && collisions?.at(1) && isColumn(collisions[1])) {
          console.log("MOVE TO COLUMN 2");
          store.dispatch(Actions.editNote(active.id.toString(), {position: {column: collisions[1].id.toString(), stack: null, rank: 0}}));
          return;
        }
      }
      if (hasActive && hasOver && topCollision && active?.id === id) {
        const rank = items.length - newIndex - 1;
        // move note within column
        console.log("REORDERING, rank: ", rank);
        store.dispatch(Actions.editNote(active.id.toString(), {position: {column: columnId, stack: null, rank}}));
      }
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={classNames(className, {shouldCombine: combine})}
      {...attributes}
      {...listeners}
      style={{transition, transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.5 : 1}}
    >
      {children}
    </div>
  );
};
