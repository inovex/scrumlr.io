import {UniqueIdentifier} from "@dnd-kit/core";
import {SortableContext, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {ReactNode} from "react";
import {SortableMode, SortableType} from "./CustomDndContext";

type SortableProps = {
  children: ReactNode;
  id: UniqueIdentifier;
  type: SortableType;
  mode: SortableMode;
  className?: string;
  items?: (UniqueIdentifier | {id: UniqueIdentifier})[];
  accentColor?: string;
  disabled?: boolean;
};

export const Sortable = ({children, id, type, mode, className, items, accentColor}: SortableProps) => {
  const {setNodeRef, setDraggableNodeRef, setDroppableNodeRef, attributes, listeners, transition, transform, isDragging} = useSortable({id, data: {type, accentColor}});

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
      className={className}
    >
      {children}
    </div>
  );

  return items ? <SortableContext items={items}>{sortable}</SortableContext> : sortable;
};
