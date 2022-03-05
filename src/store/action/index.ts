import {BoardActionFactory, BoardAction, BoardReduxAction} from "./board";
import {NoteActionFactory, NoteAction, NoteReduxAction} from "./note";
import {VoteActionFactory, VoteAction, VoteReduxAction} from "./vote";
import {ParticipantAction, ParticipantActionFactory, UsersReduxAction} from "./participants";
import {ColumnActionFactory, ColumnAction, ColumnReduxAction} from "./column";
import {RequestActionFactory, RequestAction, JoinRequestReduxAction} from "./request";
import {VotingActionFactory, VotingAction, VoteConfigurationReduxAction} from "./votings";
import {AuthActionFactory, AuthAction, UserReduxAction} from "./auth";

/** This object lists all internal Redux Action types. */
export const ActionType = {
  ...BoardAction,
  ...ColumnAction,
  ...NoteAction,
  ...AuthAction,
  ...ParticipantAction,
  ...RequestAction,
  ...VoteAction,
  ...VotingAction,
};

/** Factory or creator class of internal Redux actions. */
export const ActionFactory = {
  ...BoardActionFactory,
  ...ColumnActionFactory,
  ...NoteActionFactory,
  ...AuthActionFactory,
  ...ParticipantActionFactory,
  ...RequestActionFactory,
  ...VoteActionFactory,
  ...VotingActionFactory,
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
