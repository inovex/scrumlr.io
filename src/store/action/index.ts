import {BoardActionFactory, BoardActionType, BoardReduxAction} from "./board";
import {NoteActionFactory, NoteActionType, NoteReduxAction} from "./note";
import {UsersActionFactory, UsersActionType, UsersReduxAction} from "./users";

/** This object lists all internal Redux Action types. */
export const ActionType = {
    ...BoardActionType,
    ...NoteActionType,
    ...UsersActionType
}

/** Factory or creator class of internal Redux actions. */
export const ActionFactory = {
    ...BoardActionFactory,
    ...NoteActionFactory,
    ...UsersActionFactory
}

export type ReduxAction = BoardReduxAction | NoteReduxAction | UsersReduxAction;



