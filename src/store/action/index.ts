import {BoardActionFactory, BoardActionType, BoardReduxAction} from "./board";
import {NoteActionFactory, NoteActionType, NoteReduxAction} from "./note";
import {VoteActionFactory, VoteActionType, VoteReduxAction} from "./vote";
import {UsersActionFactory, UsersActionType, UsersReduxAction} from "./users";
import {ColumnActionFactory, ColumnActionType, ColumnReduxAction} from "./column";
import {JoinRequestActionFactory, JoinRequestActionType, JoinRequestReduxAction} from "./joinRequest";
import {VoteConfigurationActionFactory, VoteConfigurationActionType, VoteConfigurationReduxAction} from "./voteConfiguration";
import {UserActionFactory, UserActionType, UserReduxAction} from "./user";

/** This object lists all internal Redux Action types. */
export const ActionType = {
  ...BoardActionType,
  ...ColumnActionType,
  ...NoteActionType,
  ...UserActionType,
  ...UsersActionType,
  ...JoinRequestActionType,
  ...VoteActionType,
  ...VoteConfigurationActionType,
};

/** Factory or creator class of internal Redux actions. */
export const ActionFactory = {
  ...BoardActionFactory,
  ...ColumnActionFactory,
  ...NoteActionFactory,
  ...UserActionFactory,
  ...UsersActionFactory,
  ...JoinRequestActionFactory,
  ...VoteActionFactory,
  ...VoteConfigurationActionFactory,
};

/** The types of all application internal redux actions. */
export type ReduxAction =
  | BoardReduxAction
  | ColumnReduxAction
  | NoteReduxAction
  | UserReduxAction
  | UsersReduxAction
  | JoinRequestReduxAction
  | VoteReduxAction
  | VoteConfigurationReduxAction;
