import {UniqueIdentifier} from "@dnd-kit/core";
import {SortableContext, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import classNames from "classnames";
import {ReactNode} from "react";
import {SortableMode, SortableType} from "./CustomDndContext";

type SortableProps = {
  id: UniqueIdentifier;
  disabled?: boolean;
  items?: (UniqueIdentifier | {id: UniqueIdentifier})[];
  children: ReactNode;
  mode: SortableMode;
  className?: string;
  data?: {
    accentColor?: string;
    type: SortableType;
  };
};

export const Sortable = ({children, id, mode, className, items, data}: SortableProps) => {
  const {setNodeRef, setDraggableNodeRef, setDroppableNodeRef, attributes, listeners, transition, transform, isDragging, isOver, over} = useSortable({
    id,
    data,
  });

  let ref: ((element: HTMLElement | null) => void) | undefined;

  switch (mode) {
    case "both":
      ref = setNodeRef;
      break;
    case "drag":
      ref = setDraggableNodeRef;
      break;
    case "drop":
      ref = setDroppableNodeRef;
      break;
    default:
      ref = undefined;
      break;
  }

  const sortable = (
    <div
      ref={ref}
      {...attributes}
      {...listeners}
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging && mode !== "drop" ? 0.5 : 1,
      }}
      className={classNames(className, {isOver: isOver || (over?.id && items && items.includes(over.id.toString()))})}
    >
      {children}
    </div>
  );

  return items ? <SortableContext items={items}>{sortable}</SortableContext> : sortable;
};
