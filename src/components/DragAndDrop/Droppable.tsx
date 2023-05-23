import {Collision, useDndContext, useDndMonitor} from "@dnd-kit/core";
import {SortableContext, useSortable} from "@dnd-kit/sortable";
import classNames from "classnames";
import {COMBINE_THRESHOLD, MOVE_THRESHOLD} from "constants/misc";
import {ReactNode} from "react";

type DroppableProps = {
  id: string;
  items: string[];
  setItems: (items: string[]) => void;
  globalNotes: string[];
  className?: string;
  children: ReactNode;
};

const isNote = (collision: Collision) => collision.data?.droppableContainer.data.current.type === "note";

export const Droppable = ({className, children, items, id, setItems}: DroppableProps) => {
  const {setDroppableNodeRef, attributes, listeners, active, over, isOver} = useSortable({id, data: {type: "column"}});
  const {collisions} = useDndContext();
  const topCollision = collisions?.at(0);

  const isWithinCombineRange = (collision: Collision) => collision.data?.value >= COMBINE_THRESHOLD && collision.data?.value < MOVE_THRESHOLD;
  const combineCollision = collisions?.find((collision) => isNote(collision) && isWithinCombineRange(collision) && collision.id !== over?.id);
  const isOverCollision = topCollision && isNote(topCollision) ? topCollision : undefined;

  const isOverColumn = () => {
    if (combineCollision) return items.includes(combineCollision.id.toString());
    if (isOverCollision) return items.includes(isOverCollision.id.toString());
    return isOver;
  };

  const hasActive = !!active && items.includes(active.id.toString());
  const hasOver = !!topCollision && items.includes(topCollision.id.toString());
  const isOverSelf = !!topCollision && topCollision.id.toString() === id;

  useDndMonitor({
    onDragOver: () => {
      if (!active || !over) return;

      // from own column to column droppable
      if (hasActive && isOverSelf) {
        console.log(1);
        setItems([...items.filter((item) => item !== active.id.toString()), active.id.toString()]);
      }
      // from other column to column droppable
      if (!hasActive && isOverSelf) {
        console.log(2);
        setItems([...items, active.id.toString()]);
      }
      // from own column to other column/note
      if (hasActive && !(hasOver || isOverSelf)) {
        console.log(3);
        setItems(items.filter((item) => item !== active.id.toString()));
      }
      // from other column to over own note
      if (!hasActive && hasOver) {
        console.log(4);
        const overIndex = items.indexOf(topCollision.id.toString());
        if (overIndex === -1) return;
        setItems([...items.slice(0, overIndex), active.id.toString(), ...items.slice(overIndex, items.length)]);
      }
      // from own column to own note droppable
      // not necessary, will be handled in Sortable.tsx onDragEnd
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
