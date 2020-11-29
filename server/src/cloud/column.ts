import {requireValidBoardAdmin} from "./permission";
import {api} from "./util";
import { randomBytes } from "crypto";

export interface AddColumnRequest {
    boardId: string;
    name: string;
}

export interface DeleteColumnRequest {
    boardId: string;
    columnId: string;
}

export interface EditColumnRequest {
    boardId: string;
    columnId: string;
    name: string;
}

// TODO remove id generator of parse
export function randomString(size: number): string {
    if (size === 0) {
        throw new Error('Zero-length randomString is useless.');
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789';
    let objectId = '';
    const bytes = randomBytes(size);
    for (let i = 0; i < bytes.length; ++i) {
        objectId += chars[bytes.readUInt8(i) % chars.length];
    }
    return objectId;
}

export function newObjectId(size: number = 10): string {
    return randomString(size);
}

export const initializeColumnFunctions = () => {
    api<AddColumnRequest, boolean>('addColumn', async (user, request) => {
        await requireValidBoardAdmin(user, request.boardId);

        const board = await new Parse.Query('Board').get(request.boardId, { useMasterKey: true });
        if (board) {
            const columns = board.get('columns');
            columns[newObjectId()] = {
                name: request.name,
                hidden: false
            }
            await board.save({ columns }, { useMasterKey: true });
            return true;
        }

        throw new Error(`Board '${request.boardId}' not found`);
    });

    api<DeleteColumnRequest, boolean>('deleteColumn', async (user, request) => {
        await requireValidBoardAdmin(user, request.boardId);

        // TODO delete notes & votes

        const board = await new Parse.Query('Board').get(request.boardId, { useMasterKey: true });
        if (board) {
            const columns = board.get('columns');
            delete columns[request.columnId]
            await board.save({ columns }, { useMasterKey: true });
            return true;
        }

        return true;
    });

    api<EditColumnRequest, boolean>('editColumn', async (user, request) => {
        await requireValidBoardAdmin(user, request.boardId);

        const board = await new Parse.Query('Board').get(request.boardId, { useMasterKey: true });
        if (board) {
            const columns = board.get('columns');
            columns[request.columnId].name = request.name;
            await board.save({ columns }, { useMasterKey: true });
            return true;
        }

        throw new Error(`Column '${request.columnId}' on board '${request.boardId}' not found`)
    });

}