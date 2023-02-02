import {Active, Collision, UniqueIdentifier, useDndContext} from "@dnd-kit/core";
import {SortableContext, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import classNames from "classnames";
import {ReactNode} from "react";

export type SortableType = "column" | "note";
export type SortableMode = "drag" | "drop" | "both";

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

const combineThreshold: [number, number] = [0.1, 0.5];
const getShouldCombine = (id: string, items: UniqueIdentifier[], newIndex: number, collisions: Collision[] | null, active: Active | null) => {
  if (!items) {
    return false;
  }
  const newId = items[newIndex];

  if (!collisions || collisions.length < 2) {
    return false;
  }

  const {id: secondCollidingId, data: collisionData} = collisions[1];

  if (!collisionData) {
    return false;
  }
  const collisionRatio = collisionData.value;

  // NOTE: This can be improved with a custom dnd-kit collision detection
  return secondCollidingId === newId && collisionRatio != null && id !== active?.id && collisionRatio > combineThreshold[0] && collisionRatio < combineThreshold[1];
};

export const Sortable = ({children, id, mode, className, items, data}: SortableProps) => {
  const {
    setNodeRef,
    setDraggableNodeRef,
    setDroppableNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
    isOver,
    over,
    items: contextItems,
    newIndex,
    active,
  } = useSortable({
    id,
    data,
  });
  const {collisions} = useDndContext();

  let ref: ((element: HTMLElement | null) => void) | undefined;
  let shouldCombine = false;

  switch (mode) {
    case "both":
      ref = setNodeRef;
      shouldCombine = getShouldCombine(id.toString(), contextItems, newIndex, collisions, active);
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
      className={classNames(className, {shouldCombine, isOver: isOver || (over?.id && items && items.includes(over.id.toString()))})}
    >
      {children}
    </div>
  );

  return items ? <SortableContext items={items}>{sortable}</SortableContext> : sortable;
};
