import {Active, Collision, UniqueIdentifier, useDndContext, useDndMonitor, DragEndEvent, DragOverEvent} from "@dnd-kit/core";
import {arrayMove, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import classNames from "classnames";
import {COMBINE_THRESHOLD, MOVE_THRESHOLD} from "constants/misc";
import {getColorClassName} from "constants/colors";
import {ReactNode, useState} from "react";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {editNote, broadcastNoteDragStart, broadcastNoteDragEnd} from "store/features";
import {UserAvatar} from "components/BoardUsers";
import "components/Note/NoteAuthorList/NoteAuthorList.scss";
import "./DragLockIndicator.scss";
import "./Sortable.scss";

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
  const dispatch = useAppDispatch();
  const {collisions} = useDndContext();
  const {t} = useTranslation();

  // Check if this note is locked by another user
  const {lockedNotes} = useAppSelector((state) => state.dragLocks);
  const currentUserId = useAppSelector((state) => state.participants!.self!.user!.id);
  const participants = useAppSelector((state) => state.participants!);

  const draggingUserId = lockedNotes[id.toString()];
  const isLockedByOther = draggingUserId && draggingUserId !== currentUserId;
  const dragDisabled = Boolean(disabled || isLockedByOther);

  // Get the user who is dragging this note
  const findParticipantById = (userId: string) => participants.others?.find((p) => p.user!.id === userId) ?? (participants.self?.user!.id === userId ? participants.self : null);
  const draggingUser = draggingUserId ? findParticipantById(draggingUserId) : null;

  const {setNodeRef, attributes, listeners, transition, transform, isDragging, items, newIndex, active} = useSortable({
    id,
    data: {columnId, type: "note"},
    disabled: dragDisabled || undefined,
  });

  const combine = shouldCombine(id, items, newIndex, collisions, active);

  const globalNotes = useAppSelector((state) => state.notes);
  const columns = useAppSelector((state) => state.columns);

  // Get the column color for this note
  const note = globalNotes.find((n) => n.id === id.toString());
  const column = columns.find((c) => c.id === note?.position.column);
  const noteColorClassName = column ? getColorClassName(column.color) : undefined;

  const topCollision = collisions?.at(0);
  /* const hasActive = !!active && items.includes(active.id.toString());
  const hasOver = !!topCollision && items.includes(topCollision.id.toString()); */

  const [localItems, setLocalItems] = useState(items);

  useDndMonitor({
    onDragStart: (event) => {
      setLocalItems(items);
      if (event.active?.id === id) {
        dispatch(broadcastNoteDragStart(id.toString()));
      }
    },
    onDragEnd: (event: DragEndEvent) => {
      if (event.active?.id === id) {
        dispatch(broadcastNoteDragEnd(id.toString()));
      }
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

        dispatch(
          editNote({
            noteId: active.id.toString(),
            request: {
              position,
            },
          })
        );
        if (setItems) setItems(items.filter((item) => item !== active.id.toString()).map((item) => item.toString()));

        return;
      }

      if (!isActive(id, active)) return;

      if (collisions && topCollision) {
        if (items !== localItems || isColumn(topCollision)) {
          const position = {
            column: event.collisions?.find(isColumn)?.id.toString() ?? columnId,
            stack: null,
            rank: [...items].reverse().indexOf(id.toString()),
          };

          dispatch(
            editNote({
              noteId: active.id.toString(),
              request: {
                position,
              },
            })
          );
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
      className={classNames(className, "sortable", {
        shouldCombine: combine,
        "sortable--locked": isLockedByOther,
        "sortable--dragging": isDragging,
      })}
      {...attributes}
      {...listeners}
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
      }}
      tabIndex={-1}
    >
      {children}
      {isLockedByOther && draggingUser && (
        <div className={classNames("drag-lock-indicator", noteColorClassName)}>
          <div className="note-author__container note-author__container--self">
            <figure className="note__author" aria-roledescription="author">
              <UserAvatar
                id={draggingUser.user?.id!}
                avatar={draggingUser.user?.avatar}
                title={draggingUser.user?.name || "Someone"}
                className="note__user-avatar"
                avatarClassName="note__user-avatar"
              />
            </figure>
            <div className="note__author-name note__author-name--self">{t("Note.isMovingThis", {user: draggingUser.user?.name || "Someone"})}</div>
          </div>
        </div>
      )}
    </div>
  );
};
