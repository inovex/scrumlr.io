import {BoardClientModel} from "./board";
import {CardClientModel} from "./card";

export interface ApplicationState {
    board: {
        status: 'pending' | 'ready';
        data?: BoardClientModel;
    };
    cards: CardClientModel[];
}