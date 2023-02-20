import {Collision, UniqueIdentifier, useDndContext, useDndMonitor} from "@dnd-kit/core";
import {SortableContext, useSortable} from "@dnd-kit/sortable";
import classNames from "classnames";
import {COMBINE_THRESHOLD, MOVE_THRESHOLD} from "constants/misc";
import {ReactNode} from "react";
import store from "store";
import {Actions} from "store/action";

type ColumnDroppableProps = {
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  className?: string;
  children: ReactNode;
};

export const ColumnDroppable = ({className, children, items, id}: ColumnDroppableProps) => {
  const {setDroppableNodeRef, attributes, listeners, active, over, isOver} = useSortable({id, data: {type: "column"}});
  const {collisions} = useDndContext();

  const isNote = (collision: Collision) => collision.data?.droppableContainer.data.current.type === "note";
  const isWithinCombineRange = (collision: Collision) => collision.data?.value >= COMBINE_THRESHOLD && collision.data?.value < MOVE_THRESHOLD;
  const combineCollision = collisions?.find((collision) => isNote(collision) && isWithinCombineRange(collision) && collision.id !== over?.id);
  const isOverCollision = over?.data.current?.type === "note" ? collisions?.at(0) : undefined;

  const isOverColumn = () => {
    if (combineCollision) return items.includes(combineCollision.id);
    if (isOverCollision) return items.includes(isOverCollision.id);
    return isOver;
  };

  useDndMonitor({
    onDragEnd: () => {
      if (!active) return;
      const topCollision = collisions?.at(0);

      if (topCollision && topCollision.id === id) store.dispatch(Actions.editNote(active.id.toString(), {position: {column: id.toString(), stack: undefined, rank: 0}}));
    },
  });

  return (
    <SortableContext items={items}>
      <div ref={setDroppableNodeRef} className={classNames(className, {isOver: isOverColumn()})} {...attributes} {...listeners}>
        {children}
      </div>
    </SortableContext>
  );
};
