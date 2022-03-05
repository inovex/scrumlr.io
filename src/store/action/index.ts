import {BoardActionFactory, BoardActionType, BoardReduxAction} from "./board";
import {NoteActionFactory, NoteActionType, NoteReduxAction} from "./note";
import {VoteActionFactory, VoteActionType, VoteReduxAction} from "./vote";
import {ParticipantsActionType, UsersActionFactory, UsersReduxAction} from "./participants";
import {ColumnActionFactory, ColumnActionType, ColumnReduxAction} from "./column";
import {JoinRequestActionFactory, JoinRequestActionType, JoinRequestReduxAction} from "./request";
import {VoteConfigurationActionFactory, VoteConfigurationActionType, VoteConfigurationReduxAction} from "./votings";
import {AuthActionFactory, AuthActionType, UserReduxAction} from "./auth";

/** This object lists all internal Redux Action types. */
export const ActionType = {
  ...BoardActionType,
  ...ColumnActionType,
  ...NoteActionType,
  ...AuthActionType,
  ...ParticipantsActionType,
  ...JoinRequestActionType,
  ...VoteActionType,
  ...VoteConfigurationActionType,
};

/** Factory or creator class of internal Redux actions. */
export const ActionFactory = {
  ...BoardActionFactory,
  ...ColumnActionFactory,
  ...NoteActionFactory,
  ...AuthActionFactory,
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
