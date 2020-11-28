import {BoardActionFactory, BoardActionType, BoardReduxAction} from "./board";
import {CardActionFactory, CardActionType, CardReduxAction} from "./card";

/** This object lists all internal Redux Action types. */
export const ActionType = {
    ...BoardActionType,
    ...CardActionType
}

/** Factory or creator class of internal Redux actions. */
export const ActionFactory = {
    ...BoardActionFactory,
    ...CardActionFactory
}

export type ReduxAction = BoardReduxAction | CardReduxAction;



