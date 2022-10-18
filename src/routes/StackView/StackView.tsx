import classNames from "classnames";
import {useDispatch} from "react-redux";
import {useParams, useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import _ from "underscore";
import {animated, Transition} from "react-spring";
import {Color, getColorClassName} from "constants/colors";
import {NoteDialogComponents} from "components/NoteDialogComponents";
import {Portal} from "components/Portal";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./StackView.scss";
import {StackNavigation} from "components/StackNavigation";
import {useEffect, useState} from "react";

export const StackView = () => {
  const {t} = useTranslation();
  const {boardId, noteId} = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [animateDirection, setAnimateDirection] = useState<"left" | "right" | undefined>(undefined);

  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId));
  const column = useAppSelector((state) => state.columns.find((c) => c.id === note?.position.column));
  const prevColumnParent = useAppSelector((state) => {
    const prevColumns = state.columns.filter((c) => c.index < column!.index).reverse();
    let prevStack;
    while (prevColumns.length > 0 && !prevStack) {
      prevStack = state.notes.filter((n) => n.position.column === prevColumns[0]?.id && n.position.stack === null).at(-1);
      prevColumns.shift();
    }
    return prevStack;
  });
  const prevColumnStack = useAppSelector(
    (state) =>
      state.notes
        .filter((n) => n.position.stack === prevColumnParent?.id)
        .map((n) => ({
          ...n,
          authorName: state.participants?.others.find((p) => p.user.id === n.author)?.user.name ?? t("Note.me")!,
          avatar: (state.participants?.others.find((p) => p.user.id === n.author) ?? state.participants?.self)!.user.avatar,
        })),
    _.isEqual
  );
  const nextColumnParent = useAppSelector((state) => {
    const nextColumns = state.columns.slice(column!.index + 1);
    let nextStack;
    while (nextColumns.length > 0 && !nextStack) {
      nextStack = state.notes.find((n) => n.position.column === nextColumns[0].id);
      nextColumns.shift();
    }
    return nextStack;
  });
  const nextColumnStack = useAppSelector(
    (state) =>
      state.notes
        .filter((n) => n.position.stack === nextColumnParent?.id)
        .map((n) => ({
          ...n,
          authorName: state.participants?.others.find((p) => p.user.id === n.author)?.user.name ?? t("Note.me")!,
          avatar: (state.participants?.others.find((p) => p.user.id === n.author) ?? state.participants?.self)!.user.avatar,
        })),
    _.isEqual
  );
  const stacksInColumn = useAppSelector((state) => state.notes.filter((n) => n.position.column === column?.id && n.position.stack === null));
  const author = useAppSelector((state) => state.participants?.others.find((participant) => participant.user.id === note?.author) ?? state.participants?.self);
  const authorName = useAppSelector((state) => (author?.user.id === state.participants?.self.user.id ? t("Note.me") : author!.user.name));
  const stackedNotes = useAppSelector(
    (state) =>
      state.notes
        .filter((n) => n.position.stack === note?.id)
        .map((n) => ({
          ...n,
          authorName: state.participants?.others.find((p) => p.user.id === n.author)?.user.name ?? t("Note.me")!,
          avatar: (state.participants?.others.find((p) => p.user.id === n.author) ?? state.participants?.self)!.user.avatar,
        })),
    _.isEqual
  );
  const moderating = useAppSelector((state) => state.view.moderating);
  const showAuthors = useAppSelector((state) => state.board.data?.showAuthors ?? true);
  const viewer = useAppSelector((state) => state.participants!.self);

  useEffect(() => () => setAnimateDirection(undefined), []);

  if (!note) {
    navigate(`/board/${boardId}`);
    return null;
  }

  const handleClose = () => {
    if (moderating && (viewer.role === "MODERATOR" || viewer.role === "OWNER")) {
      dispatch(Actions.stopSharing());
    }
    navigate(`/board/${boardId}`);
  };

  const getTransform = (state: "start" | "end") => {
    if (animateDirection === "left") {
      return state === "start" ? "translateX(-100%)" : "translateX(100%)";
    }
    if (animateDirection === "right") {
      return state === "start" ? "translateX(100%)" : "translateX(-100%)";
    }
    return "translateX(0)";
  };

  const items = [
    {parent: prevColumnParent, stack: prevColumnStack},
    {parent: note, stack: stackedNotes},
    {parent: nextColumnParent, stack: nextColumnStack},
  ];

  const navigationProps = {
    stacks: stacksInColumn,
    currentStack: note.id,
    prevColumnStack: prevColumnParent?.id,
    nextColumnStack: nextColumnParent?.id,
    setAnimateDirection,
  };

  return (
    <Portal onClose={handleClose} className={classNames("stack-view__portal", getColorClassName(column!.color as Color))} hiddenOverflow centered disabledPadding>
      <div className={classNames("stack-view", getColorClassName(column!.color as Color))}>
        <NoteDialogComponents.Header columnName={column!.name} />
        <StackNavigation {...navigationProps} />
        <Transition
          from={{transform: getTransform("start"), position: "absolute", opacity: 0}}
          enter={{transform: "translate(0%)", position: "relative", opacity: 1}}
          leave={{
            transform: getTransform("end"),
            position: "absolute",
            top: "26.8vh",
            opacity: 0,
          }}
          items={items}
        >
          {(styles: object, item) => (
            <animated.div style={styles} className="stack-view__animation-wrapper">
              {item.parent?.position.column === column!.id && (
                <>
                  {/* TODO: Fix author */}
                  <NoteDialogComponents.Note
                    key={item.parent!.id}
                    noteId={item.parent!.id}
                    text={item.parent!.text}
                    authorId={item.parent!.author}
                    avatar={author!.user.avatar}
                    authorName={authorName}
                    showAuthors={showAuthors}
                    onClose={handleClose}
                    onDeleteOfParent={handleClose}
                    showUnstackButton={false}
                    viewer={viewer}
                    className="stack-view__parent-note"
                  />
                  <NoteDialogComponents.Wrapper>
                    {item.stack?.map((n) => (
                      <NoteDialogComponents.Note
                        key={n.id}
                        noteId={n.id}
                        text={n.text}
                        authorId={n.author}
                        avatar={n.avatar}
                        authorName={n.authorName}
                        showAuthors={showAuthors}
                        onClose={handleClose}
                        onDeleteOfParent={handleClose}
                        showUnstackButton
                        viewer={viewer}
                      />
                    ))}
                  </NoteDialogComponents.Wrapper>
                </>
              )}
            </animated.div>
          )}
        </Transition>
      </div>
      <button onClick={handleClose} className="stack-view__close-button">
        <CloseIcon />
      </button>
    </Portal>
  );
};
