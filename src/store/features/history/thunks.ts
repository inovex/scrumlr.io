import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState, retryable} from "store";
import {API} from "api";
import {EditableTemplateColumn} from "../templateColumns/types";
import {BoardOverview, HistoryBoard} from "./types";

// maps the raw GET /boards shape to the app-facing HistoryBoard
const toHistoryBoard = (overview: BoardOverview): HistoryBoard => ({
  id: overview.board.id,
  name: overview.board.name ?? "",
  description: overview.board.description ?? "",
  accessPolicy: overview.board.accessPolicy,
  columns: overview.columns,
  participants: overview.participants,
  createdAt: new Date(overview.board.createdAt),
  modifiedAt: new Date(overview.board.lastModifiedAt),
  notes: overview.noteCount,
  isLocked: overview.board.isLocked,
  userRole: overview.role,
  favourite: overview.favourite,
});

export const getBoards = createAsyncThunk<HistoryBoard[], void, {state: ApplicationState}>("history/getBoards", async () => {
  const overviews = await API.getBoards();
  return overviews.map(toHistoryBoard);
});

export const setBoardFavourite = createAsyncThunk<{boardId: string; favourite: boolean}, {boardId: string; favourite: boolean}, {state: ApplicationState}>(
  "history/setBoardFavourite",
  async ({boardId, favourite}, {getState, dispatch}) => {
    const userId = getState().auth.user?.id;
    if (userId) {
      const updateFavouriteOnServer = () => API.editParticipant(boardId, userId, {favourite});
      const retrySetBoardFavourite = () => setBoardFavourite({boardId, favourite});

      await retryable(
        updateFavouriteOnServer,
        dispatch,
        retrySetBoardFavourite,
        "editSelf"
      );
    }
    return {boardId, favourite};
  }
);

export const deleteHistoryBoard = createAsyncThunk<string, string, {state: ApplicationState}>("history/deleteBoard", async (boardId, {dispatch}) => {
  await retryable(
    () => API.deleteBoard(boardId),
    dispatch,
    () => deleteHistoryBoard(boardId),
    "deleteBoard"
  );
  return boardId;
});

// saves board edits: metadata via editBoard, changed columns via the per-column endpoints, then refetches for server truth.
export const saveBoardEdit = createAsyncThunk<
  void,
  {boardId: string; name: string; description: string; columns: EditableTemplateColumn[]; deletedColumns: EditableTemplateColumn[]},
  {state: ApplicationState}
>("history/saveBoardEdit", async ({boardId, name, description, columns, deletedColumns}, {dispatch}) => {
  await API.editBoard(boardId, {name, description});

  const columnsToCreate = columns.filter((column) => column.mode === "create");
  const columnsToEdit = columns.filter((column) => column.mode === "edit");
  const columnsToDelete = deletedColumns.filter((column) => column.mode === "delete");

  await Promise.all([
    ...columnsToCreate.map((column) =>
      API.createColumn(boardId, {
        name: column.name,
        color: column.color,
        visible: column.visible,
        index: column.index,
      })
    ),
    ...columnsToEdit.map((column) =>
      API.editColumn(boardId, column.id, {
        name: column.name,
        description: column.description,
        color: column.color,
        visible: column.visible,
        index: column.index,
      })
    ),
    ...columnsToDelete.map((column) => API.deleteColumn(boardId, column.id)),
  ]);

  await dispatch(getBoards());
});
