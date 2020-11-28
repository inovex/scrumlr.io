import {BoardActionFactory, BoardActionType, BoardReduxAction} from "./board";
import {CardActionFactory, CardActionType, CardReduxAction} from "./card";
import {UsersActionFactory, UsersActionType, UsersReduxAction} from "./users";

/** This object lists all internal Redux Action types. */
export const ActionType = {
    ...BoardActionType,
    ...CardActionType,
    ...UsersActionType
}

/** Factory or creator class of internal Redux actions. */
export const ActionFactory = {
    ...BoardActionFactory,
    ...CardActionFactory,
    ...UsersActionFactory
}

export type ReduxAction = BoardReduxAction | CardReduxAction | UsersReduxAction;



