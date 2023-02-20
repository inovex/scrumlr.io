import {Active, Collision, Over, UniqueIdentifier, useDndContext, useDndMonitor} from "@dnd-kit/core";
import {SortableContext, useSortable} from "@dnd-kit/sortable";
import classNames from "classnames";
import {COMBINE_THRESHOLD, MOVE_THRESHOLD} from "constants/misc";
import {ReactNode, useEffect, useState} from "react";
import store from "store";
import {Actions} from "store/action";

type ColumnDroppableProps = {
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  className?: string;
  children: ReactNode;
};

const getColumn = (draggable: Active | Over): string | undefined => {
  const currentData = draggable.data.current;

  if (currentData?.type === "column") return draggable.id.toString();
  if (currentData?.type === "note") return currentData.columnId;
  return undefined;
};

export const ColumnDroppable = ({className, children, items, id}: ColumnDroppableProps) => {
  const {setDroppableNodeRef, attributes, listeners, active, over, isOver} = useSortable({id, data: {type: "column"}});
  const {collisions} = useDndContext();

  const [localItems, setLocalItems] = useState(items);
  const isNote = (collision: Collision) => collision.data?.droppableContainer.data.current.type === "note";
  const isWithinCombineRange = (collision: Collision) => collision.data?.value >= COMBINE_THRESHOLD && collision.data?.value < MOVE_THRESHOLD;
  const combineCollision = collisions?.find((collision) => isNote(collision) && isWithinCombineRange(collision) && collision.id !== over?.id);
  const isOverCollision = over?.data.current?.type === "note" ? collisions?.at(0) : undefined;

  const isOverColumn = () => {
    if (combineCollision) return localItems.includes(combineCollision.id);
    if (isOverCollision) return localItems.includes(isOverCollision.id);
    return isOver;
  };

  useEffect(() => {
    console.log(localItems.map((item) => item.toString().slice(0, 4)));
  }, [localItems]);

  useDndMonitor({
    onDragEnd: () => {
      if (!active) return;
      const topCollision = collisions?.at(0);

      if (topCollision && topCollision.id === id) store.dispatch(Actions.editNote(active.id.toString(), {position: {column: id.toString(), stack: undefined, rank: 0}}));
    },
    onDragOver: ({over: o, active: a}) => {
      console.log(o?.id);
      if (!o || !a) return;

      const overColumn = getColumn(o);
      if (overColumn === id.toString() && localItems.includes(a.id)) return;
      if (overColumn !== id.toString() && !localItems.includes(a.id)) return;

      if (overColumn === id.toString()) setLocalItems([a.id, ...localItems]);
      if (localItems.includes(a.id)) setLocalItems(localItems.filter((item) => item !== a.id));
    },
  });

  return (
    <SortableContext items={localItems}>
      <div ref={setDroppableNodeRef} className={classNames(className, {isOver: isOverColumn()})} {...attributes} {...listeners}>
        {children}
      </div>
    </SortableContext>
  );
};
