import Parse from 'parse';
import store from "../store/store";
import {ActionFactory} from "../store/action";

export const newBoard = async () => {
    if (Parse.User.current()) {
        return await Parse.Cloud.run("createBoard", {});
    }
    throw new Error('Not authorized');
}

export const joinBoard = async (boardId: string) => {
    const joinBoardResponse = await Parse.Cloud.run('joinBoard', { board: boardId })
    if (joinBoardResponse.status === 'accepted') {
        store.dispatch(ActionFactory.joinBoard(boardId));
    }
    return joinBoardResponse;
}