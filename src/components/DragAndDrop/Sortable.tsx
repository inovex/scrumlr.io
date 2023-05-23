import {Active, Collision, UniqueIdentifier, useDndContext, useDndMonitor, DragEndEvent, DragOverEvent} from "@dnd-kit/core";
import {arrayMove, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import classNames from "classnames";
import {COMBINE_THRESHOLD, MOVE_THRESHOLD} from "constants/misc";
import {ReactNode, useState} from "react";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";

type SortableProps = {
  id: UniqueIdentifier;
  columnId?: string;
  children: ReactNode;
  disabled?: boolean;
  setItems: (items: string[]) => void;
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
  // if (items?.[newIndex] !== active.id) return false;
  const noteCollisions = collisions?.filter((collision) => !isColumn(collision));
  const maxNoteCollision = noteCollisions?.at(noteCollisions.length > 1 ? 1 : 0);

  if (!maxNoteCollision) return false;

  const collisionRatio = maxNoteCollision.data?.value;

  return collisionRatio && collisionRatio >= COMBINE_THRESHOLD && collisionRatio < MOVE_THRESHOLD;
};

export const Sortable = ({id, children, disabled, className, columnId, setItems}: SortableProps) => {
  const {collisions} = useDndContext();
  const {setNodeRef, attributes, listeners, transition, transform, isDragging, items, newIndex, active} = useSortable({
    id,
    data: {columnId, type: "note"},
    disabled,
  });

  const combine = shouldCombine(id, items, newIndex, collisions, active);

  const globalNotes = useAppSelector((state) => state.notes);

  const topCollision = collisions?.at(0);
  const hasActive = !!active && items.includes(active.id.toString());
  const hasOver = !!topCollision && items.includes(topCollision.id.toString());

  const [localItems, setLocalItems] = useState(items);

  useDndMonitor({
    onDragStart: () => {
      setLocalItems(items);
    },
    onDragEnd: (event: DragEndEvent) => {
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
        console.log("new index:", newIndex);
        console.log("STACKING", items);
        console.log("maybe on top of", maxNoteCollision.id);
        console.log("or on top of", items[newIndex]);
        console.log(event.active.id === event.over?.id);
        // BUG: colmn should be columnId of maxNoteCollision
        // const stackId = !event.over || maxNoteCollision.id !== active.id ? maxNoteCollision.id.toString() : event.over?.id.toString();
        // const stackId = event.over?.id.toString() ?? maxNoteCollision.id.toString();
        /* let stackId = maxNoteCollision.id.toString();
        if (event.over && maxNoteCollision.id === active.id) {
          stackId = event.over.id.toString();
        } */
        /* let stackId = event.over?.id.toString();
        if (!stackId || stackId === active.id.toString()) {
          stackId = maxNoteCollision.id.toString();
        } */
        const stackId = maxNoteCollision.id.toString();
        console.log("stackId", stackId);
        store.dispatch(Actions.editNote(active.id.toString(), {position: {stack: stackId, column: columnId, rank: 0}}));
        return;
      }

      if (!isActive(id, active)) return;

      if (collisions && topCollision) {
        console.log(event);
        if (items !== localItems) {
          // BUG: newIndex should not be the index but rather the rank of the note that was at that index
          const newIndex = items.length - items.indexOf(id.toString()) - 1;
          const newColumnId = event.collisions?.find((collision) => isColumn(collision))?.id.toString() ?? columnId;
          console.log(localItems[newIndex]);
          const newRank = globalNotes.find((note) => note.id === localItems[items.indexOf(id.toString())])?.position.rank;
          console.log(active.id, newRank);

          /* setLocalItems(items); */

          store.dispatch(Actions.editNote(active.id.toString(), {position: {column: newColumnId, stack: null, rank: newRank!}}));
          return;
        }
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
    onDragOver: (event: DragOverEvent) => {
      if (id !== active?.id) return;
      if (!event.over) return;
      const currentIndex = items.indexOf(id.toString());
      const newNoteIndex = items.indexOf(event.over.id.toString());

      const newItems = arrayMove(items, currentIndex, newNoteIndex).map((item) => item.toString());

      setItems(newItems);
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
