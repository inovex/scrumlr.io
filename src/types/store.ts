import {BoardClientModel} from "./board";
import {CardClientModel} from "./card";
import {UserClientModel} from "./user";

export interface UsersState {
    admins: UserClientModel[];
    basic: UserClientModel[];
    all: UserClientModel[];
}

export interface ApplicationState {
    board: {
        status: 'pending' | 'ready';
        data?: BoardClientModel;
    };
    cards: CardClientModel[];
    users: UsersState
}