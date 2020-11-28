import { Action } from 'redux';
import {CardClientModel} from "../types/card";

export const LEAVE_BOARD = '@@SCRUMLR/leaveBoard';
export type LeaveBoardAction = Action<typeof LEAVE_BOARD>;

export const JOIN_BOARD = '@@SCRUMLR/joinBoard';
export interface JoinBoardAction extends Action<typeof JOIN_BOARD> {
    boardId: string;
}

export const ADD_CARD = '@@SCRUMLR/addCard';
export interface AddCardAction extends Action<typeof ADD_CARD> {
    text: string;
}

export const CREATED_CARD = '@@SCRUMLR/createCard';
export interface CreatedCardAction extends Action<typeof CREATED_CARD> {
    card: CardClientModel;
}

export const DELETE_CARD = '@@SCRUMLR/deleteCard';
export interface DeleteCardAction extends Action<typeof DELETE_CARD> {
    cardId: string;
}

export const Actions = {
    leaveBoard: (): LeaveBoardAction => ({
        type: LEAVE_BOARD
    }),
    joinBoard: (board: string): JoinBoardAction => ({
        type: JOIN_BOARD,
        boardId: board
    }),
    addCard: (boardId: string, text: string): AddCardAction => ({
        type: ADD_CARD,
        text
    }),
    createdCard: (card: CardClientModel): CreatedCardAction => ({
        type: CREATED_CARD,
        card
    }),
    deleteCard: (cardId: string): DeleteCardAction => ({
        type: DELETE_CARD,
        cardId
    })
}