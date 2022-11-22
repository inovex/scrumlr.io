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
import {CSSProperties, useEffect, useRef, useState} from "react";
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
  const column = columns.find((c) => c.id === note?.position.column);
  const prevColumnParent = useAppSelector((state) => {
    const prevColumns = state.columns.filter((c) => c.index < column!.index).reverse();
    let prevStack;
    while (prevColumns.length > 0 && !prevStack) {
      prevStack = state.notes.filter((n) => n.position.column === prevColumns[0]?.id && n.position.stack === null).at(-1);
      prevColumns.shift();
    }
    return prevStack?.id;
  });
  const nextColumnParent = useAppSelector((state) => {
    const nextColumns = state.columns.slice(column!.index + 1);
    let nextStack;
    while (nextColumns.length > 0 && !nextStack) {
      nextStack = state.notes.find((n) => n.position.column === nextColumns[0].id);
      nextColumns.shift();
    }
    return nextStack?.id;
  });
  const stacksInColumn = useAppSelector((state) => state.notes.filter((n) => n.position.column === column?.id && n.position.stack === null), _.isEqual);
  const moderating = useAppSelector((state) => state.view.moderating, _.isEqual);
  const showAuthors = useAppSelector((state) => state.board.data?.showAuthors ?? true, _.isEqual);
  const viewer = useAppSelector((state) => state.participants!.self, _.isEqual);
  const userIsModerating = moderating && (viewer.role === "MODERATOR" || viewer.role === "OWNER");

  const [transitionConfig, setTransitionConfig] = useState({
    from: {transform: "translate(0%)", position: "absolute", opacity: 0},
    enter: {transform: "translate(0%)", position: "relative", opacity: 1},
    leave: {
      transform: "translate(0%)",
      position: "absolute",
      opacity: 0,
    },
    items: {
      parent: note,
      stack: stackedNotes,
      avatar: author!.user.avatar,
      authorName,
    },
  });

  useEffect(() => {
    if (prevNote.current && prevNote.current?.id !== note?.id) {
      let direction: "left" | "right" | undefined;
      if (prevNote.current?.position?.column === note?.position?.column) {
        direction = prevNote.current?.position?.rank > note!.position.rank ? "right" : "left";
      } else {
        const oldColumnIndex = columns.findIndex((c) => c.id === prevNote.current?.position.column);
        const newColumnIndex = columns.findIndex((c) => c.id === note?.position.column);
        direction = oldColumnIndex > newColumnIndex ? "left" : "right";
      }
      setTransitionConfig({
        from: {
          transform: getTransform("start", direction),
          position: "absolute",
          opacity: 0,
        },
        enter: {transform: "translate(0%)", position: "relative", opacity: 1},
        leave: {
          transform: getTransform("end", direction),
          position: "absolute",
          opacity: 0,
        },
        items: {
          parent: note,
          stack: stackedNotes,
          avatar: author!.user.avatar,
          authorName,
        },
      });
      prevNote.current = note;
    }
  }, [author, authorName, columns, note, stackedNotes]);

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

  const navigationProps = {
    stacks: stacksInColumn,
    currentStack: note.id,
    prevColumnStack: prevColumnParent,
    nextColumnStack: nextColumnParent,
    handleModeration,
  };

  return (
    <Portal onClose={handleClose} className={classNames("stack-view__portal", getColorClassName(column!.color as Color))} hiddenOverflow centered disabledPadding>
      <div className={classNames("stack-view", getColorClassName(column!.color as Color))}>
        <NoteDialogComponents.Header columnName={column!.name} />
        <StackNavigation {...navigationProps} />
        <div className="stack-view__content">
          <Transition {...transitionConfig}>
            {(styles: CSSProperties, item: {parent?: Note; stack: StackedNote[]; avatar?: AvataaarProps; authorName: string}) => (
              <animated.div style={styles} className="stack-view__animation-wrapper">
                {item.parent?.position.column === column!.id && (
                  <>
                    <NoteDialogComponents.Note
                      key={item.parent!.id}
                      noteId={item.parent!.id}
                      text={item.parent!.text}
                      authorId={item.parent!.author}
                      avatar={item.avatar}
                      authorName={item.authorName}
                      showAuthors={showAuthors}
                      onClose={handleClose}
                      onDeleteOfParent={handleClose}
                      showUnstackButton={false}
                      viewer={viewer}
                      className="stack-view__parent-note"
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
      </div>
      <div className={classNames("stack-view__border", {"stack-view__border--moderating": userIsModerating}, getColorClassName(column!.color as Color))} />
      <button onClick={handleClose} className="stack-view__close-button">
        <CloseIcon />
      </button>
    </Portal>
  );
};
