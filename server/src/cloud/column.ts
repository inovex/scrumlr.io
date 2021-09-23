import {newObjectId} from "parse-server/lib/cryptoUtils";
import {requireValidBoardAdmin} from "./permission";
import {api} from "./util";
import {serverConfig} from "../index";
import Color, {isOfTypeColor} from "../util/Color";

export interface AddColumnRequest {
  boardId: string;
  column: {
    name: string;
    color: Color;
    hidden: boolean;
  };
}

export interface DeleteColumnRequest {
  boardId: string;
  columnId: string;
}

export interface EditColumnRequest {
  boardId: string;
  column: {
    columnId: string;
    name?: string;
    color?: Color;
    hidden?: boolean;
  };
}

export const initializeColumnFunctions = () => {
  api<AddColumnRequest, {status: string; description: string}>("addColumn", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});

    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.boardId}' does not exist`};
    }

    const columns = board.get("columns");
    if (!isOfTypeColor(request.column.color)) {
      throw new Error(`color ${request.column.color} is not allowed for columns`);
    }

    columns[newObjectId(serverConfig.objectIdSize)] = {
      name: request.column.name,
      color: request.column.color,
      hidden: request.column.hidden,
    };

    await board.save(null, {useMasterKey: true});
    return {status: "Success", description: `New column added`};
  });

  api<DeleteColumnRequest, {status: string; description: string}>("deleteColumn", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);

    // TODO delete notes & votes

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.boardId}' does not exist`};
    }

    const columns = board.get("columns");
    delete columns[request.columnId];
    await board.save(null, {useMasterKey: true});

    return {status: "Success", description: `Column ${request.columnId} deleted`};
  });

  api<EditColumnRequest, {status: string; description: string}>("editColumn", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.boardId}' does not exist`};
    }
    const columns = board.get("columns");
    if (request.column.name) {
      columns[request.column.columnId].name = request.column.name;
    }

    if (request.column.color) {
      if (isOfTypeColor(request.column.color)) {
        columns[request.column.columnId].color = request.column.color;
      } else {
        throw new Error(`specified column color '${request.column.color}' is not allowed`);
      }
    }

    if (request.column.hidden != undefined) {
      columns[request.column.columnId].hidden = request.column.hidden;
    }

    await board.save(null, {useMasterKey: true});

    return {status: "Success", description: `Column ${request.column.columnId} edited`};
  });
};
