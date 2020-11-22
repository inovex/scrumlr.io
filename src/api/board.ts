import Parse from 'parse';
import store from "../store/store";

export const newBoard = async () => {
    if (Parse.User.current()) {
        return await Parse.Cloud.run("createBoard", {});
    }
    throw new Error('Not authorized');
}

export const joinBoard = async (boardId: string) => {
    const joinBoardResponse = await Parse.Cloud.run('joinBoard', { board: boardId })
    if (joinBoardResponse.status === 'accepted') {
        store.dispatch({
            type: '@@SCRUMLR/joinBoard',
            board: boardId
        });
    }
    return joinBoardResponse;
}