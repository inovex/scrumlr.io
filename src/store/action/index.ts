import {BoardActionFactory, BoardAction, BoardReduxAction} from "./board";
import {NoteActionFactory, NoteAction, NoteReduxAction} from "./note";
import {VoteActionFactory, VoteAction, VoteReduxAction} from "./vote";
import {ParticipantAction, ParticipantActionFactory, ParticipantReduxAction} from "./participants";
import {ColumnActionFactory, ColumnAction, ColumnReduxAction} from "./column";
import {RequestActionFactory, RequestAction, RequestReduxAction} from "./request";
import {VotingActionFactory, VotingAction, VotingReduxAction} from "./votings";
import {AuthActionFactory, AuthAction, AuthReduxAction} from "./auth";
import {ViewAction, ViewActionFactory, ViewReduxAction} from "./view";
import {AssignmentAction, AssignmentActionFactory, AssignmentReduxAction} from "./assignment";
import {ReactionAction, ReactionActionFactory, ReactionReduxAction} from "./reaction";

/** This object lists all internal Redux Action types. */
export const Action = {
  ...BoardAction,
  ...ColumnAction,
  ...NoteAction,
  ...ReactionAction,
  ...AuthAction,
  ...ParticipantAction,
  ...RequestAction,
  ...VoteAction,
  ...VotingAction,
  ...ViewAction,
  ...AssignmentAction,
};

/** Factory or creator class of internal Redux actions. */
export const Actions = {
  ...BoardActionFactory,
  ...ColumnActionFactory,
  ...NoteActionFactory,
  ...ReactionActionFactory,
  ...RequestActionFactory,
  ...AuthActionFactory,
  ...ParticipantActionFactory,
  ...RequestActionFactory,
  ...VoteActionFactory,
  ...VotingActionFactory,
  ...ViewActionFactory,
  ...AssignmentActionFactory,
};

/** The types of all application internal redux actions. */
export type ReduxAction = {context: {board?: string; user?: string; voting?: string; serverTimeOffset: number}} & (
  | BoardReduxAction
  | ColumnReduxAction
  | NoteReduxAction
  | ReactionReduxAction
  | AuthReduxAction
  | ParticipantReduxAction
  | RequestReduxAction
  | VoteReduxAction
  | VotingReduxAction
  | ViewReduxAction
  | AssignmentReduxAction
);
