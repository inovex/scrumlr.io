import {CardClientModel} from "../../types/card";
import {ActionType, ReduxAction} from "../action";
import Parse from "parse";

export const cardReducer = (state: CardClientModel[] = [], action: ReduxAction): CardClientModel[] => {
    switch (action.type) {
        case ActionType.AddCard: {
            const localCard: CardClientModel = {
                text: action.text,
                author: Parse.User.current()!.id,
                dirty: true
            }
            return [ ...state, localCard ];
        }
        case ActionType.CreatedCard: {
            const newState = [ ...state ];
            const foundExistingCardIndex = newState.findIndex((card) => (!card.id && card.text === action.card.text));
            if (foundExistingCardIndex >= 0) {
                newState.splice(foundExistingCardIndex, 1, action.card);
            } else {
                newState.push(action.card);
            }
            return newState;
        }
        case ActionType.DeleteCard: {
            return state.filter((card) => card.id !== action.cardId);
        }
        case ActionType.EditCard: {
            const cardIndex = state.findIndex((card) => card.id === action.cardId);
            return state.splice(cardIndex, 1, {
                ...state[cardIndex],
                text: action.text,
                dirty: true
            });
        }
        case ActionType.UpdatedCard: {
            const cardIndex = state.findIndex((card) => card.id === action.card.id && card.text === action.card.text);
            if (cardIndex >= 0) {
                return state.splice(cardIndex, 1, action.card);
            }
            return state;
        }
        case ActionType.InitializeCards: {
            return [ ...action.cards ];
        }
    }
    return state;
}