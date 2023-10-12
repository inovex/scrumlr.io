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
import {ReactComponent as TrashIcon} from "assets/icon-delete.svg";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {Toast} from "utils/Toast";
import "./StackView.scss";
import {StackNavigation} from "components/StackNavigation";
import {CSSProperties, useEffect, useLayoutEffect, useRef, useState} from "react";
import {Note} from "types/note";
import {AvataaarProps} from "components/Avatar";

type StackedNote = Note & {
  authorName: string;
  avatar?: AvataaarProps;
};

const getTransform = (state: "start" | "end", dir?: "left" | "right") => {
  if (!dir) return "translateX(0%)";
  const st = state === "start" ? -1 : 1;
  const dr = dir === "right" ? -1 : 1;
  return `translateX(${st * dr * 100}%)`;
};

export const StackView = () => {
  const {boardId, noteId} = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId));
  const prevNote = useRef<Note | undefined>(note);
  const columns = useAppSelector((state) => state.columns, _.isEqual);
  const author = useAppSelector((state) => state.participants?.others.find((participant) => participant.user.id === note?.author) ?? state.participants?.self);
  const authorName = useAppSelector((state) => (author?.user.id === state.participants?.self.user.id ? t("Note.me") : author?.user.name));
  const viewer = useAppSelector((state) => state.participants!.self, _.isEqual);
  const showNotesOfOtherUsers = useAppSelector((state) => state.board?.data?.showNotesOfOtherUsers);
  const stackedNotes = useAppSelector(
    (state) =>
      state.notes
        .filter((n) => n.position.stack === note?.id)
        // if showNotesOfOtherUsers is disabled, only show own notes
        // same as showNotesOfOtherUsers ? true : n.author === viewer.user.id
        .filter((n) => showNotesOfOtherUsers || n.author === viewer.user.id)
        .map((n) => ({
          ...n,
          authorName: state.participants?.others.find((p) => p.user.id === n.author)?.user.name ?? t("Note.me")!,
          avatar: (state.participants?.others.find((p) => p.user.id === n.author) ?? state.participants?.self)?.user.avatar,
        })),
    _.isEqual
  );
  const column = columns.find((c) => c.id === note?.position.column);
  const prevColumnParent = useAppSelector((state) => {
    if (!column) return undefined;
    // the last stack in the previous column
    const columnIndex = state.columns.findIndex((c) => c.id === column.id);
    let prevColumns = state.columns.filter((c, index) => index < columnIndex).reverse(); // get all columns before current column, in descending order
    if (viewer.role === "PARTICIPANT") prevColumns = prevColumns.filter((c) => c.visible); // filter out all columns that are not visible to the participant
    let prevStack;
    while (prevColumns.length > 0 && !prevStack) {
      prevStack = state.notes
        .filter((n) => n.position.column === prevColumns[0]?.id && n.position.stack === null)
        .filter((n) => showNotesOfOtherUsers || n.author === viewer.user.id)
        .at(-1);
      prevColumns.shift();
    }
    return prevStack?.id;
  });
  const nextColumnParent = useAppSelector((state) => {
    if (!column) return undefined;
    // the first stack in the next column
    const columnIndex = state.columns.findIndex((c) => c.id === column.id);
    let nextColumns = state.columns.slice(columnIndex + 1); // get all columns after current column, in ascending order
    if (viewer.role === "PARTICIPANT") nextColumns = nextColumns.filter((c) => c.visible); // filter out all columns that are not visible to the participant
    let nextStack;
    while (nextColumns.length > 0 && !nextStack) {
      nextStack = state.notes
        .filter((n) => n.position.column === nextColumns[0].id && n.position.stack === null)
        .filter((n) => showNotesOfOtherUsers || n.author === viewer.user.id)
        .at(0);
      nextColumns.shift();
    }
    return nextStack?.id;
  });
  const stacksInColumn = useAppSelector(
    (state) =>
      state.notes
        .filter((n) => n.position.column === column?.id && n.position.stack === null) // card in column and not part of a stack
        .filter((n) => showNotesOfOtherUsers || n.author === viewer.user.id),
    _.isEqual
  );
  const moderating = useAppSelector((state) => state.view.moderating, _.isEqual);
  const showAuthors = useAppSelector((state) => state.board.data?.showAuthors ?? true, _.isEqual);
  const showNoteReactions = useAppSelector((state) => state.board.data?.showNoteReactions ?? true, _.isEqual);
  const userIsModerating = moderating && (viewer.role === "MODERATOR" || viewer.role === "OWNER");

  const colorClassName = getColorClassName(column?.color as Color);

  const [transitionConfig, setTransitionConfig] = useState({
    from: {transform: "translateX(0%)", position: "relative", opacity: 0},
    enter: {transform: "translateX(0%)", position: "relative", opacity: 1},
    leave: {
      transform: "translateX(0%)",
      position: "relative",
      opacity: 0,
    },
    items: {
      parent: note,
      stack: stackedNotes,
      avatar: author?.user.avatar,
      authorName: authorName ?? "",
    },
  });

  const authorRef = useRef<{name: string | undefined; avatar?: AvataaarProps}>({name: authorName, avatar: author?.user.avatar});
  const stackedNotesRef = useRef<StackedNote[]>(stackedNotes);

  const hasMixedAuthors = (stack: Note[]) => {
    if (!stack || !author) return undefined;
    const authors = stack.map((n) => n.author);
    return authors.some((item) => item !== authors[0]);
  };
  const entireStack = useAppSelector((state) => state.notes.filter((n) => n.id === note?.id || n.position.stack === note?.id));
  const stackHasMixedAuthors = hasMixedAuthors(entireStack);

  // update transition config when note changes so that the visible notes are updated without any animation
  useEffect(() => {
    if (
      prevNote.current?.id === note?.id &&
      (!_.isEqual(prevNote.current, note) || !_.isEqual(authorRef.current, {name: authorName, avatar: author?.user.avatar}) || !_.isEqual(stackedNotesRef.current, stackedNotes))
    ) {
      setTransitionConfig({
        from: {transform: "translateX(0%)", position: "relative", opacity: 1},
        enter: {transform: "translateX(0%)", position: "relative", opacity: 1},
        leave: {
          transform: "translateX(0%)",
          position: "absolute",
          opacity: 1,
        },
        items: {
          parent: note,
          stack: stackedNotes,
          avatar: author?.user.avatar,
          authorName: authorName ?? "",
        },
      });
    }
    authorRef.current = {name: authorName, avatar: author?.user.avatar};
    stackedNotesRef.current = stackedNotes;
  }, [author, authorName, note, stackedNotes]);

  // update transition config when navigating to a new note
  useEffect(() => {
    if (prevNote.current && prevNote.current?.id !== note?.id) {
      let direction: "left" | "right" | undefined;
      if (prevNote.current?.position?.column === note?.position?.column) {
        direction = prevNote.current?.position?.rank > note.position.rank ? "right" : "left";
      } else {
        const oldColumnIndex = columns.findIndex((c) => c.id === prevNote.current?.position.column);
        const newColumnIndex = columns.findIndex((c) => c.id === note?.position.column);
        direction = oldColumnIndex > newColumnIndex ? "left" : "right";
      }
      setTransitionConfig({
        from: {
          transform: getTransform("start", direction),
          position: "relative",
          opacity: 0,
        },
        enter: {transform: "translateX(0%)", position: "relative", opacity: 1},
        leave: {
          transform: getTransform("end", direction),
          position: "absolute",
          opacity: 0,
        },
        items: {
          parent: note,
          stack: stackedNotes,
          avatar: author?.user.avatar,
          authorName: authorName ?? "",
        },
      });
      prevNote.current = note;
    }
  }, [author, authorName, columns, note, stackedNotes]);

  // redirect to stack and show toast if note has been stacked on another note
  useEffect(() => {
    if (note && prevNote.current && !prevNote.current.position.stack && note.position.stack) {
      navigate(`/board/${boardId}/note/${note.position.stack}/stack`);
      Toast.info({title: t("Toast.noteMovedToStack")});
    }
  }, [boardId, navigate, note, t]);

  // show toast if note has been deleted
  useLayoutEffect(() => {
    if (prevNote.current && !note) {
      Toast.info({title: t("Toast.noteDeleted"), icon: TrashIcon});
    }
  }, [note, t]);

  if (!note) {
    navigate(`/board/${boardId}`);
    return null;
  }

  const handleClose = () => {
    if (userIsModerating) {
      dispatch(Actions.stopSharing());
    }
    navigate(`/board/${boardId}`);
  };

  const handleModeration = (id: string) => {
    if (userIsModerating) {
      dispatch(Actions.shareNote(id));
    }
  };

  // when showNotesOfOtherUsers is updated, check if user is currently looking at a note they are not supposed to see.
  // if true, close the stack view.
  if (!showNotesOfOtherUsers && note.author !== viewer.user.id) {
    handleClose();
  }

  const navigationProps = {
    stacks: stacksInColumn,
    currentStack: note.id,
    prevColumnStack: prevColumnParent,
    nextColumnStack: nextColumnParent,
    handleModeration,
  };

  return (
    <Portal
      onClose={handleClose}
      className={classNames("stack-view__portal", colorClassName, {"stack-view__portal-moderation-visible": moderating})}
      hiddenOverflow
      centered
      disabledPadding
    >
      <div className={classNames("stack-view", colorClassName)}>
        <NoteDialogComponents.Header columnName={column?.name ?? ""} />
        <StackNavigation {...navigationProps} />
        <div className="stack-view__content">
          <Transition {...transitionConfig}>
            {(styles: CSSProperties, item: {parent?: Note; stack: StackedNote[]; avatar?: AvataaarProps; authorName: string}) => (
              <animated.div style={styles} className="stack-view__animation-wrapper">
                {item.parent && item.parent.position.column === column?.id && (
                  <>
                    <NoteDialogComponents.Note
                      key={item.parent.id}
                      noteId={item.parent.id}
                      text={item.parent.text}
                      authorId={item.parent.author}
                      avatar={item.avatar}
                      authorName={item.authorName}
                      showAuthors={showAuthors}
                      showNoteReactions={showNoteReactions}
                      onClose={handleClose}
                      isStackedNote={false}
                      hasStackedNotes={item.stack.length > 0}
                      stackHasMixedAuthors={stackHasMixedAuthors}
                      viewer={viewer}
                      className="stack-view__parent-note"
                      colorClassName={colorClassName}
                    />
                    <NoteDialogComponents.Wrapper>
                      {item.stack?.map((n: StackedNote) => (
                        <NoteDialogComponents.Note
                          key={n.id}
                          noteId={n.id}
                          text={n.text}
                          authorId={n.author}
                          avatar={n.avatar}
                          authorName={n.authorName}
                          showAuthors={showAuthors}
                          showNoteReactions={showNoteReactions}
                          onClose={handleClose}
                          isStackedNote
                          viewer={viewer}
                          className="stack-view__child-note"
                          colorClassName={colorClassName}
                        />
                      ))}
                    </NoteDialogComponents.Wrapper>
                  </>
                )}
              </animated.div>
            )}
          </Transition>
        </div>
      </div>
      <div className={classNames("stack-view__border", {"stack-view__border--moderating": userIsModerating}, colorClassName)} />
      <button onClick={handleClose} className="stack-view__close-button">
        <CloseIcon />
      </button>
    </Portal>
  );
};
