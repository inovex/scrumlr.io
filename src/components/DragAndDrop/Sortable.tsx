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
  setItems?: (items: string[]) => void;
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

  if (!maxNoteCollision || maxNoteCollision.id === active?.id) return false;

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
  /* const hasActive = !!active && items.includes(active.id.toString());
  const hasOver = !!topCollision && items.includes(topCollision.id.toString()); */

  const [localItems, setLocalItems] = useState(items);

  useDndMonitor({
    onDragStart: () => {
      setLocalItems(items);
    },
    onDragEnd: (event: DragEndEvent) => {
      if (!columnId || !active) return;

      if (shouldStack(id, items, newIndex, collisions, active)) {
        // combine notes
        const noteCollisions = collisions?.filter((collision) => !isColumn(collision));
        const maxNoteCollision = noteCollisions?.at(noteCollisions.length > 1 ? 1 : 0);
        if (!maxNoteCollision) return;

        const note = globalNotes.find((n) => n.id === maxNoteCollision.id.toString());
        const position = {
          stack: maxNoteCollision.id.toString(),
          column: note?.position.column ?? columnId,
          rank: note?.position.rank ?? 0,
        };

        store.dispatch(Actions.editNote(active.id.toString(), {position}));
        if (setItems) setItems(items.filter((item) => item !== active.id.toString()).map((item) => item.toString()));

        return;
      }

      if (!isActive(id, active)) return;

      if (collisions && topCollision) {
        if (items !== localItems || isColumn(topCollision)) {
          const position = {
            column: event.collisions?.find((collision) => isColumn(collision))?.id.toString() ?? columnId,
            stack: null,
            rank: items.reverse().indexOf(id.toString()),
          };

          store.dispatch(Actions.editNote(active.id.toString(), {position}));
        }
      }
    },
    onDragOver: (event: DragOverEvent) => {
      if (id !== active?.id) return;
      if (!event.over) return;
      const currentIndex = items.indexOf(id.toString());
      const newNoteIndex = items.indexOf(event.over.id.toString());

      const newItems = arrayMove(items, currentIndex, newNoteIndex).map((item) => item.toString());

      if (setItems) setItems(newItems);
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={classNames(className, {shouldCombine: combine})}
      {...attributes}
      {...listeners}
      style={{transition, transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.5 : 1, touchAction: "manipulation"}}
    >
      {children}
    </div>
  );
};
