import classNames from "classnames";
import {useDispatch} from "react-redux";
import {useParams, useNavigate} from "react-router";
import _ from "underscore";
import {Color, getColorClassName} from "constants/colors";
import {NoteDialogComponents} from "components/NoteDialog/NoteDialogComponents";
import {Portal} from "components/Portal";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import "./StackView.scss";

export const StackView = () => {
  const {boardId, noteId} = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId));
  const column = useAppSelector((state) => state.columns.find((c) => c.id === note?.position.column));
  const authorName = useAppSelector(
    (state) => state.participants?.others.find((participant) => participant.user.id === note?.author)?.user.name ?? state.participants?.self.user.name ?? ""
  );
  const stackedNotes = useAppSelector(
    (state) =>
      state.notes
        .filter((n) => n.position.stack === note?.id)
        .map((n) => ({
          ...n,
          authorName: state.participants?.others.find((p) => p.user.id === n.author)?.user.name ?? state.participants?.self.user.name ?? "",
        })),
    _.isEqual
  );
  const viewer = useAppSelector((state) => state.participants!.self);
  const moderating = useAppSelector((state) => state.view.moderating);
  const showAuthors = useAppSelector((state) => state.board.data?.showAuthors ?? true);

  if (!note) {
    navigate(`/board/${boardId}`);
  }

  const handleClose = () => {
    if (moderating && (viewer.role === "MODERATOR" || viewer.role === "OWNER")) {
      dispatch(Actions.stopSharing());
    }
    navigate(`/board/${boardId}`);
  };

  const props = {
    noteId,
    text: note!.text,
    authorId: note!.author,
    columnName: column!.name,
    columnColor: column!.color,
    columnVisible: column!.visible,
    childrenNotes: stackedNotes,
    authorName,
    showAuthors,
    viewer,
    moderating,
    onClose: handleClose,
    onDeleteOfParent: handleClose,
  };

  return (
    <Portal onClose={handleClose} className="stack-view__portal" hiddenOverflow centered disabledPadding>
      <div className={classNames("stack-view", getColorClassName(props.columnColor as Color))}>
        <NoteDialogComponents.Header columnName={props.columnName} />
        <NoteDialogComponents.Wrapper>
          <NoteDialogComponents.Note {...props} showUnstackButton={false} />
          {props.childrenNotes.map((n) => (
            <NoteDialogComponents.Note {...props} {...note} parentId={props.noteId} key={n.id} showUnstackButton noteId={n.id} authorId={n.author} />
          ))}
        </NoteDialogComponents.Wrapper>
      </div>
    </Portal>
  );
};
