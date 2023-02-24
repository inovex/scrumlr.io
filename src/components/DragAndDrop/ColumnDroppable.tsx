import {Collision, useDndContext, useDndMonitor} from "@dnd-kit/core";
import {arrayMove, SortableContext, useSortable} from "@dnd-kit/sortable";
import classNames from "classnames";
import {COMBINE_THRESHOLD, MOVE_THRESHOLD} from "constants/misc";
import {ReactNode} from "react";
import store from "store";
import {Actions} from "store/action";

type ColumnDroppableProps = {
  id: string;
  items: string[];
  setItems: (items: string[]) => void;
  className?: string;
  children: ReactNode;
};

export const ColumnDroppable = ({className, children, items, id, setItems}: ColumnDroppableProps) => {
  const {setDroppableNodeRef, attributes, listeners, active, over, isOver} = useSortable({id, data: {type: "column"}});
  const {collisions} = useDndContext();

  const isNote = (collision: Collision) => collision.data?.droppableContainer.data.current.type === "note";
  const isWithinCombineRange = (collision: Collision) => collision.data?.value >= COMBINE_THRESHOLD && collision.data?.value < MOVE_THRESHOLD;
  const combineCollision = collisions?.find((collision) => isNote(collision) && isWithinCombineRange(collision) && collision.id !== over?.id);
  const isOverCollision = over?.data.current?.type === "note" ? collisions?.at(0) : undefined;

  const isOverColumn = () => {
    if (combineCollision) return items.includes(combineCollision.id.toString());
    if (isOverCollision) return items.includes(isOverCollision.id.toString());
    return isOver;
  };

  const topCollision = collisions?.at(0);
  const hasActive = !!active && items.includes(active.id.toString());
  const hasOver = !!topCollision && items.includes(topCollision.id.toString());
  const isOverSelf = !!topCollision && topCollision.id.toString() === id;

  useDndMonitor({
    onDragEnd: () => {
      if (!active) return;

      if (hasActive && hasOver && topCollision) {
        const overIndex = items.indexOf(topCollision.id.toString());
        const activeIndex = items.indexOf(active.id.toString());

        setItems(arrayMove(items, activeIndex, overIndex));
      }
      if (topCollision && topCollision.id.toString() === id) {
        store.dispatch(Actions.editNote(active.id.toString(), {position: {column: id, stack: undefined, rank: 0}}));
      }
    },
    onDragOver: ({over: o}) => {
      console.log(o?.id.toString().slice(0, 4), over?.id.toString().slice(0, 4));
      if (!active || !over) return;

      // from own column to column droppable
      if (hasActive && isOverSelf) setItems([...items.filter((item) => item !== active.id.toString()), active.id.toString()]);
      // from other column to column droppable
      if (!hasActive && isOverSelf) setItems([...items, active.id.toString()]);
      // from own column to other column/note
      if (hasActive && !(hasOver || isOverSelf)) setItems(items.filter((item) => item !== active.id.toString()));
      if (!hasActive && hasOver) {
        const overIndex = items.indexOf(topCollision.id.toString());
        if (overIndex === -1) return;
        setItems([...items.slice(0, overIndex), active.id.toString(), ...items.slice(overIndex, items.length)]);
      }
      // from own column to own note droppable
      // not necessary, will be handled in onDragEnd
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
