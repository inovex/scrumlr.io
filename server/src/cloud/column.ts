import {newObjectId} from "parse-server/lib/cryptoUtils";
import {requireValidBoardAdmin} from "./permission";
import {api} from "./util";
import {serverConfig} from "../index";
import Color from "../util/Color";

export interface AddColumnRequest {
  boardId: string;
  name: string;
  color: Color;
  hidden: boolean;
}

export interface DeleteColumnRequest {
  boardId: string;
  columnId: string;
}

export interface EditColumnRequest {
  boardId: string;
  columnId: string;
  name?: string;
  color?: Color;
  hidden?: boolean;
}

export const initializeColumnFunctions = () => {
  api<AddColumnRequest, boolean>("addColumn", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    if (board) {
      const columns = board.get("columns");
      columns[newObjectId(serverConfig.objectIdSize)] = {
        name: request.name,
        color: request.color,
        hidden: request.hidden,
      };
      await board.save({columns}, {useMasterKey: true});
      return true;
    }

    throw new Error(`Board '${request.boardId}' not found`);
  });

  api<DeleteColumnRequest, boolean>("deleteColumn", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);

    // TODO delete notes & votes

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    if (board) {
      const columns = board.get("columns");
      delete columns[request.columnId];
      await board.save({columns}, {useMasterKey: true});
      return true;
    }

    return true;
  });

  api<EditColumnRequest, boolean>("editColumn", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    if (board) {
      const columns = board.get("columns");
      if (request.name) {
        columns[request.columnId].name = request.name;
      }

      if (request.color) {
        columns[request.columnId].color = request.color;
      }

      if (request.hidden !== undefined) {
        columns[request.columnId].hidden = request.hidden;
      }

      await board.save({columns}, {useMasterKey: true});
      return true;
    }

    throw new Error(`Column '${request.columnId}' on board '${request.boardId}' not found`);
  });
};
