import {BoardClientModel} from "./board";
import {CardClientModel} from "./card";
import {UserClientModel} from "./user";

export interface BoardState {
    status: 'pending' | 'ready';
    data?: BoardClientModel;
}

export interface UsersState {
    admins: UserClientModel[];
    basic: UserClientModel[];
    all: UserClientModel[];
}

export interface ApplicationState {
    board: BoardState;
    cards: CardClientModel[];
    users: UsersState
}