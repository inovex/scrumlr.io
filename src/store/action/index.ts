import {BoardActionFactory, BoardActionType, BoardReduxAction} from "./board";
import {NoteActionFactory, NoteActionType, NoteReduxAction} from "./note";
import {VoteActionFactory, VoteActionType, VoteReduxAction} from "./vote";
import {UsersActionFactory, UsersActionType, UsersReduxAction} from "./users";
import {ColumnActionFactory, ColumnActionType, ColumnReduxAction} from "./column";
import {JoinRequestActionFactory, JoinRequestActionType, JoinRequestReduxAction} from "./joinRequest";

/** This object lists all internal Redux Action types. */
export const ActionType = {
  ...BoardActionType,
  ...ColumnActionType,
  ...NoteActionType,
  ...UsersActionType,
  ...JoinRequestActionType,
  ...VoteActionType,
};

/** Factory or creator class of internal Redux actions. */
export const ActionFactory = {
  ...BoardActionFactory,
  ...ColumnActionFactory,
  ...NoteActionFactory,
  ...UsersActionFactory,
  ...JoinRequestActionFactory,
  ...VoteActionFactory,
};

/** The types of all application internal redux actions. */
export type ReduxAction = BoardReduxAction | ColumnReduxAction | NoteReduxAction | UsersReduxAction | JoinRequestReduxAction | VoteReduxAction;
