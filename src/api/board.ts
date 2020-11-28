import Parse from 'parse';
import {Api} from "./api";

export const newBoard = async () => {
    if (Parse.User.current()) {
        return await Api.createBoard();
    }
    throw new Error('Not authorized');
}