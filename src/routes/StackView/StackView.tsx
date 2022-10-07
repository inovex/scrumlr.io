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
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./StackView.scss";
import {useState} from "react";

export const StackView = () => {
  const {t} = useTranslation();
  const {boardId, noteId} = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showDeletionDialog, setShowDeletionDialog] = useState(false);

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
    return null;
  }

  const handleClose = () => {
    if (moderating && (viewer.role === "MODERATOR" || viewer.role === "OWNER")) {
      dispatch(Actions.stopSharing());
    }
    if (showDeletionDialog) {
      setShowDeletionDialog(false);
    } else {
      navigate(`/board/${boardId}`);
    }
  };

  const handleDelete = (isDialogOpen: boolean, id?: string) => {
    setShowDeletionDialog(isDialogOpen);

    if (!isDialogOpen) {
      setShowDeletionDialog(true);
    }
    if (id) {
      dispatch(Actions.deleteNote(id));
    }
  };

  return (
    <Portal onClose={handleClose} className={classNames("stack-view__portal", getColorClassName(column!.color as Color))} hiddenOverflow centered disabledPadding>
      <div className={classNames("stack-view", getColorClassName(column!.color as Color))}>
        <NoteDialogComponents.Header columnName={column!.name} />
        <NoteDialogComponents.Note
          key={noteId}
          noteId={noteId!}
          text={note!.text}
          authorId={note!.author}
          avatar={author!.user.avatar}
          authorName={authorName}
          showAuthors={showAuthors}
          isParentNote={stackedNotes.length > 0}
          onClose={handleClose}
          onDeleteOfParent={handleClose}
          showUnstackButton={false}
          showDeletionDialog={setShowDeletionDialog}
          handleDelete={handleDelete}
          viewer={viewer}
          className="stack-view__parent-note"
        />
        <NoteDialogComponents.Wrapper>
          {stackedNotes.map((n) => (
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
              showDeletionDialog={setShowDeletionDialog}
              showUnstackButton
              handleDelete={handleDelete}
              viewer={viewer}
            />
          ))}
        </NoteDialogComponents.Wrapper>
      </div>
      <button onClick={handleClose} className="stack-view__close-button">
        <CloseIcon />
      </button>
      {showDeletionDialog && (
        <Portal
          onClose={handleClose}
          className={classNames("stack-view__portal", "stack-view__inception", getColorClassName(column!.color as Color))}
          hiddenOverflow
          centered
          disabledPadding
        >
          <div className={classNames("stack-view", getColorClassName(column!.color as Color))}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
              <div className="dialog__quit">
                <img src="https://www.freeiconspng.com/uploads/black-x-png-27.png" />
              </div>
              <img src="https://www.w3schools.com/images/w3lynx_200.png" className="dialog__icon" />
              <div className="dialog__content">
                <h3>What do you want to delete?</h3>
                <p>This note/stack will be deleted permanently. This action can not be revoked.</p>
                <div className="dialog__content-buttons">
                  <button onClick={() => handleDelete(false)} className="dialog__content-buttons-button primary">
                    Delete Note
                  </button>
                  <button className="dialog__content-buttons-button">Delete Stack</button>
                  <button onClick={() => setShowDeletionDialog(false)} className="dialog__content-buttons-button">
                    cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </Portal>
  );
};
