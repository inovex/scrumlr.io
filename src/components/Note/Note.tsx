import classNames from "classnames";
import React, {useRef, useEffect} from "react";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import _ from "underscore";
import {UserAvatar} from "components/BoardUsers";
import {Votes} from "components/Votes";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {Participant} from "types/participant";
import "./Note.scss";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {Color, getColorClassName} from "constants/colors";
import {Active, Collision, Over, UniqueIdentifier, useDndContext} from "@dnd-kit/core";

interface NoteProps {
  noteId: string;
  viewer: Participant;
  color?: Color;
}

const combineThreshold: [number, number] = [0.1, 0.4];
const getShouldCombine = (id: string, items: UniqueIdentifier[], newIndex: number, collisions: Collision[] | null, active: Active | null, over: Over | null) => {
  const isSelf = (collision: Collision) => over?.id === collision.id;
  const isColumn = (collision: Collision) => collision.data?.droppableContainer.data.current.type === "column";

  const otherCollisions = collisions?.filter((collision) => !isSelf(collision) && !isColumn(collision));
  if (!otherCollisions?.length) return false;
  const maxCollision = otherCollisions[0];
  const isMaxCollision = maxCollision.id === items[newIndex];
  const collisionRatio = maxCollision.data?.value;
  if (!collisionRatio) return false;
  if (!isMaxCollision) return false;
  const selfCollisionRatio = collisions?.find(isSelf)?.data?.value;
  const ratioDiff = selfCollisionRatio - collisionRatio;
  const isInRange = ratioDiff >= combineThreshold[0] && ratioDiff <= combineThreshold[1];
  console.log(selfCollisionRatio - collisionRatio, selfCollisionRatio, collisionRatio, isInRange);
  return isInRange;
};

export const Note = (props: NoteProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const noteRef = useRef<HTMLButtonElement>(null);

  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId), _.isEqual);
  const isStack = useAppSelector((state) => state.notes.filter((n) => n.position.stack === props.noteId).length > 0);
  const isShared = useAppSelector((state) => state.board.data?.sharedNote === props.noteId);
  const allowStacking = useAppSelector((state) => state.board.data?.allowStacking ?? true);
  const author = useAppSelector((state) => {
    const noteAuthor = state.participants?.others.find((p) => p.user.id === note!.author) ?? state.participants?.self;
    const isSelf = noteAuthor?.user.id === state.participants?.self.user.id;
    const displayName = isSelf ? t("Note.me") : noteAuthor!.user.name;
    return {
      ...noteAuthor,
      displayName,
      isSelf,
    };
  }, _.isEqual);

  const showAuthors = useAppSelector((state) => !!state.board.data?.showAuthors);
  const moderating = useAppSelector((state) => state.view.moderating);
  const isModerator = props.viewer.role === "MODERATOR" || props.viewer.role === "OWNER";

  const {setNodeRef, attributes, listeners, transition, transform, isDragging, items, newIndex, active, over} = useSortable({
    id: props.noteId,
    data: {type: isStack ? "stack" : "note", accentColor: props.color ? getColorClassName(props.color) : undefined},
    disabled: !(isModerator || allowStacking),
  });
  const {collisions} = useDndContext();
  const shouldCombine = getShouldCombine(props.noteId, items, newIndex, collisions, active, over);

  /* eslint-disable */
  useEffect(() => {
    if (isShared && !document.location.pathname.endsWith(props.noteId + "/stack")) {
      navigate(`note/${note!.id}/stack`);
    }
  }, []);

  useEffect(() => {
    if (isShared) {
      if (!document.location.pathname.endsWith(props.noteId + "/stack")) {
        navigate(`note/${note!.id}/stack`);
      }
    } else if (document.location.pathname.endsWith(props.noteId)) {
      navigate(`.`);
    }
  }, [isShared]);
  /* eslint-enable */

  const handleClick = () => {
    if (moderating && isModerator) {
      dispatch(Actions.shareNote(props.noteId));
    }
    navigate(`note/${props.noteId}/stack`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      navigate(`note/${props.noteId}/stack`);
    }
  };

  // TODO: replace with stack setting from state when implemented. thanks, love u <3
  const stackSetting: "stackOntop" | "stackBetween" | "stackBelow" = "stackBetween";

  return (
    <div
      className={classNames("note__root", {shouldCombine})}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <button className={`note note--${stackSetting}`} onClick={handleClick} onKeyPress={handleKeyPress} ref={noteRef}>
        <p className="note__text">{note!.id}</p>
        <div className="note__footer">
          {(showAuthors || props.viewer.user.id === author.user!.id) && (
            <figure className={classNames("note__author", {"note__author--self": author.isSelf})} aria-roledescription="author">
              <UserAvatar id={note!.author} avatar={author.user!.avatar} title={author.displayName} className="note__user-avatar" avatarClassName="note__user-avatar" />
              <figcaption className="note__author-name">{author.displayName}</figcaption>
            </figure>
          )}
          <Votes noteId={props.noteId!} aggregateVotes />
        </div>
      </button>
      {isStack && <div className="note__in-stack" />}
    </div>
  );
};
