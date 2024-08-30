import {BoardActionFactory, BoardAction, BoardReduxAction} from "../features/board/actions";
import {NoteActionFactory, NoteAction, NoteReduxAction} from "../features/notes/actions";
import {VoteActionFactory, VoteAction, VoteReduxAction} from "../features/votes/actions";
import {ParticipantAction, ParticipantActionFactory, ParticipantReduxAction} from "../features/participants/actions";
import {ColumnActionFactory, ColumnAction, ColumnReduxAction} from "../features/columns/actions";
import {RequestActionFactory, RequestAction, RequestReduxAction} from "../features/requests/actions";
import {VotingActionFactory, VotingAction, VotingReduxAction} from "../features/votings/actions";
import {AuthActionFactory, AuthAction, AuthReduxAction} from "../features/auth/actions";
import {ViewAction, ViewActionFactory, ViewReduxAction} from "../features/view/actions";
import {ReactionAction, ReactionActionFactory, ReactionReduxAction} from "../features/reactions/actions";
import {BoardReactionAction, BoardReactionActionFactory, BoardReactionReduxAction} from "../features/boardReactions/actions";
import {SkinToneAction, SkinToneActionFactory, SkinToneReduxAction} from "../features/skinTone/actions";

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
  ...BoardReactionAction,
  ...SkinToneAction,
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
  ...BoardReactionActionFactory,
  ...SkinToneActionFactory,
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
  | BoardReactionReduxAction
  | SkinToneReduxAction
);
