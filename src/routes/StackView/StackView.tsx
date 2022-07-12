import classNames from "classnames";
import {useDispatch} from "react-redux";
import {useParams, useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import _ from "underscore";
import {Color, getColorClassName} from "constants/colors";
import {NoteDialogComponents} from "components/NoteDialogComponents";
import {Portal} from "components/Portal";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import "./StackView.scss";

export const StackView = () => {
  const {t} = useTranslation();
  const {boardId, noteId} = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId));
  const column = useAppSelector((state) => state.columns.find((c) => c.id === note?.position.column));
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

  if (!note) {
    navigate(`/board/${boardId}`);
  }

  const handleClose = () => {
    if (moderating && (viewer.role === "MODERATOR" || viewer.role === "OWNER")) {
      dispatch(Actions.stopSharing());
    }
    navigate(`/board/${boardId}`);
  };

  return (
    <Portal onClose={handleClose} className="stack-view__portal" hiddenOverflow centered disabledPadding>
      <div className={classNames("stack-view", getColorClassName(column!.color as Color))}>
        <NoteDialogComponents.Header columnName={column!.name} />
        <NoteDialogComponents.Wrapper>
          <NoteDialogComponents.Note
            key={noteId}
            noteId={noteId}
            text={note!.text}
            authorId={note!.author}
            avatar={author!.user.avatar}
            authorName={authorName}
            showAuthors={showAuthors}
            onClose={handleClose}
            onDeleteOfParent={handleClose}
            showUnstackButton={false}
            viewer={viewer}
          />
          {stackedNotes.map((n) => (
            <NoteDialogComponents.Note
              key={n.id}
              noteId={n.id}
              parentId={noteId}
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
      </div>
    </Portal>
  );
};
