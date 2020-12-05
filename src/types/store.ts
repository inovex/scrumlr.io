import {BoardClientModel} from "./board";
import {NoteClientModel} from "./note";
import {UserClientModel} from "./user";

export interface BoardState {
    status: 'unknown' | 'pending' | 'ready' | 'rejected' | 'accepted';
    data?: BoardClientModel;
}

export interface UsersState {
    admins: UserClientModel[];
    basic: UserClientModel[];
    all: UserClientModel[];
}

export interface ApplicationState {
    board: BoardState;
    notes: NoteClientModel[];
    users: UsersState
}