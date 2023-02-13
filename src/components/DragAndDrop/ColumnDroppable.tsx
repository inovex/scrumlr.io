import {UniqueIdentifier, useDndMonitor} from "@dnd-kit/core";
import {SortableContext, useSortable} from "@dnd-kit/sortable";
import classNames from "classnames";
import {COMBINE_THRESHOLD} from "constants/misc";
import {ReactNode} from "react";
import store from "store";
import {Actions} from "store/action";

type ColumnDroppableProps = {
  id: UniqueIdentifier;
  items: (
    | UniqueIdentifier
    | {
        id: UniqueIdentifier;
      }
  )[];
  className?: string;
  children: ReactNode;
};

export const ColumnDroppable = ({className, children, items, id}: ColumnDroppableProps) => {
  const {setDroppableNodeRef, attributes, listeners, isOver, over} = useSortable({id, data: {type: "column"}});
  const isOverColumn = isOver || (over?.id && items.includes(over.id.toString()));

  useDndMonitor({
    onDragEnd: ({collisions, active}) => {
      if (!active) return;
      const secondCollision = collisions?.at(1);
      if (secondCollision && secondCollision.data?.current?.type !== "column" && secondCollision.data?.value > COMBINE_THRESHOLD) return;
      const topCollision = collisions?.at(0);
      if (topCollision && topCollision.id === id) store.dispatch(Actions.editNote(active.id.toString(), {position: {column: id.toString(), stack: undefined, rank: 0}}));
    },
  });

  return (
    <SortableContext items={items}>
      <div ref={setDroppableNodeRef} className={classNames(className, {isOver: isOverColumn})} {...attributes} {...listeners}>
        {children}
      </div>
    </SortableContext>
  );
};
