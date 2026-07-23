import {useEffect, useState} from "react";
import {Navigate, useNavigate, useParams} from "react-router";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {EditableTemplateColumn, getBoards, saveBoardEdit} from "store/features";
import {isParticipantModerator} from "utils/participant";
import {CheckDoneIcon} from "components/Icon";
import {LoadingScreen} from "components/LoadingScreen";
import {ErrorPage} from "components/ErrorPage";
import {EditorShell, EditorSubmitPayload} from "../TemplateEditor/EditorShell";
import "./BoardEditor.scss";

// edits an existing board using the shared Temlate EditorShell
export const BoardEditor = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {boardId} = useParams();
  const historyLoaded = useAppSelector((state) => state.history.length > 0);
  const board = useAppSelector((state) => state.history.find((b) => b.id === boardId));

  // `attempted` tracks whether we've finished trying to load the history, independent of whether it
  // returned any boards, because otherwise an empty history (length stays 0) would spin forever.
  const [attempted, setAttempted] = useState(false);

  // when deep-linked/refreshed (i.e. /edit-board/{id}) straight into the editor, the History page never ran the fetch, so load it here.
  useEffect(() => {
    if (historyLoaded) {
      setAttempted(true);
      return;
    }
    dispatch(getBoards()).finally(() => setAttempted(true));
  }, [dispatch, historyLoaded]);

  if (!attempted && !board) return <LoadingScreen />;
  if (!board) {
    return (
      <div className="board-editor__error">
        <ErrorPage errorMessage={t("BoardEditor.loadError")} originURL="/boards/history" />
      </div>
    );
  }
  // role gating: only owners and moderators may edit; participants are redirected.
  if (!isParticipantModerator(board.userRole)) return <Navigate to="/boards/history" />;

  // seed the editor with the board's real columns, in their current order.
  const initialColumns: EditableTemplateColumn[] = [...board.columns]
    .sort((a, b) => a.index - b.index)
    .map((column) => ({...column, template: board.id, persisted: true, mode: undefined}));

  const saveBoard = (payload: EditorSubmitPayload) => {
    dispatch(
      saveBoardEdit({
        boardId: board.id,
        name: payload.name,
        description: payload.description,
        columns: payload.columns,
        deletedColumns: payload.deletedColumns,
      })
    )
      .unwrap()
      .then(() => navigate("/boards/history"));
  };
    //TODO: Maybe add a warn dialog before navigating away from the editor with edits pending
  return (
    <EditorShell
      editorId={board.id}
      initialName={board.name}
      initialDescription={board.description}
      initialColumns={initialColumns}
      submitLabel={t("BoardEditor.save")}
      submitIcon={<CheckDoneIcon />}
      onSubmit={saveBoard}
      onCancel={() => navigate("/boards/history")}
    />
  );
};
