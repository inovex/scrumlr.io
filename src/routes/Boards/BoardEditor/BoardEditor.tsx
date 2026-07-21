import {useEffect} from "react";
import {Navigate, useNavigate, useParams} from "react-router";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {Column, EditableTemplateColumn, getBoards, updateHistoryBoard} from "store/features";
import {isParticipantModerator} from "utils/participant";
import {CheckDoneIcon} from "components/Icon";
import {LoadingScreen} from "components/LoadingScreen";
import {EditorShell, EditorSubmitPayload} from "../TemplateEditor/EditorShell";

// edits an existing board using the shared EditorShell.
// mock-first: board data comes from the history slice and "save" patches it in place.
// TODO: swap to real data (GET /boards for initial data, PUT /boards/{id} + column endpoints on save).
export const BoardEditor = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {boardId} = useParams();
  const historyLoaded = useAppSelector((state) => state.history.length > 0);
  const board = useAppSelector((state) => state.history.find((b) => b.id === boardId));

  // when deep-linked/refreshed straight into the editor, the History page never ran the fetch, so load it here.
  // TODO: with real data, track a loaded/status flag so a genuinely empty history doesn't render the loader forever.
  useEffect(() => {
    if (!historyLoaded) dispatch(getBoards());
  }, [dispatch, historyLoaded]);

  if (!historyLoaded) return <LoadingScreen />;
  if (!board) return <div>Error loading board</div>;
  //role gating
  if (!isParticipantModerator(board.userRole)) return <Navigate to="/boards/history" />;

  // seed the editor with the board's real columns, in their current order.
  const initialColumns: EditableTemplateColumn[] = [...board.columns]
    .sort((a, b) => a.index - b.index)
    .map((column) => ({...column, template: board.id, persisted: true, mode: undefined}));

  const saveBoard = (payload: EditorSubmitPayload) => {
    // re-derive index from the current order so reordering/adding is reflected.
    const columns: Column[] = payload.columns.map((column, index) => ({
      id: column.id,
      name: column.name,
      description: column.description,
      color: column.color,
      visible: column.visible,
      index,
    }));

    dispatch(updateHistoryBoard({id: board.id, changes: {name: payload.name, description: payload.description, columns}}));
    navigate("/boards/history");
  };
    //TODO: warn dialog before navigating away from the editor with edits pending
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
