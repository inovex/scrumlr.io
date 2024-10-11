import {Board} from "../store/features/board/types";
import {Column} from "../store/features/columns/types";
import {Participant} from "../store/features/participants/types";
import {Note} from "../store/features/notes/types";
import {Vote} from "../store/features/votes/types";
import {Voting} from "../store/features/votings/types";
import {Request} from "../store/features/requests/types";
import {Reaction} from "../store/features/reactions/types";
import {BoardReactionType} from "../store/features/boardReactions/types";

export interface BoardInitEvent {
  type: "INIT";
  data: {
    board: Board;
    columns: Column[];
    notes?: Note[];
    reactions?: Reaction[];
    votings?: Voting[];
    votes?: Vote[];
    participants: Participant[];
    requests?: Request[];
  };
}

export interface BoardUpdateEvent {
  type: "BOARD_UPDATED";
  data: Board;
}

export interface BoardTimerUpdateEvent {
  type: "BOARD_TIMER_UPDATED";
  data: Board;
}

export interface BoardDeletedEvent {
  type: "BOARD_DELETED";
}

export interface UpdatedColumnsEvent {
  type: "COLUMNS_UPDATED";
  data: Column[];
}

export interface DeletedColumnEvent {
  type: "COLUMN_DELETED";
  data: string;
}

export interface UpdatedNotesEvent {
  type: "NOTES_UPDATED";
  data: Note[];
}

export interface SyncNotesEvent {
  type: "NOTES_SYNC";
  data: Note[];
}

export interface DeletedNoteEvent {
  type: "NOTE_DELETED";
  data: {
    note: string;
    deleteStack: boolean;
  };
}

export interface AddedReactionEvent {
  type: "REACTION_ADDED";
  data: Reaction;
}

export interface DeletedReactionEvent {
  type: "REACTION_DELETED";
  data: string;
}

export interface UpdatedReactionEvent {
  type: "REACTION_UPDATED";
  data: Reaction;
}

export interface RequestCreatedEvent {
  type: "REQUEST_CREATED";
  data: Request;
}

export interface RequestUpdatedEvent {
  type: "REQUEST_UPDATED";
  data: Request;
}

export interface ParticipantCreatedEvent {
  type: "PARTICIPANT_CREATED";
  data: Participant;
}

export interface ParticipantUpdatedEvent {
  type: "PARTICIPANT_UPDATED";
  data: Participant;
}

export interface ParticipantsUpdatedEvent {
  type: "PARTICIPANTS_UPDATED";
  data: Participant[];
}

export interface VotingCreatedEvent {
  type: "VOTING_CREATED";
  data: Voting;
}

export interface VotingUpdatedEvent {
  type: "VOTING_UPDATED";
  data: {
    voting: Voting;
    notes?: Note[];
  };
}

export interface UpdatedVotesEvent {
  type: "VOTES_UPDATED";
  data: Vote[];
}

export interface AddedBoardReactionEvent {
  type: "BOARD_REACTION_ADDED";
  data: BoardReactionType;
}

export type ServerEvent =
  | BoardInitEvent
  | BoardUpdateEvent
  | BoardTimerUpdateEvent
  | BoardDeletedEvent
  | UpdatedColumnsEvent
  | DeletedColumnEvent
  | UpdatedNotesEvent
  | DeletedNoteEvent
  | SyncNotesEvent
  | AddedReactionEvent
  | DeletedReactionEvent
  | UpdatedReactionEvent
  | RequestCreatedEvent
  | RequestUpdatedEvent
  | ParticipantCreatedEvent
  | ParticipantUpdatedEvent
  | ParticipantsUpdatedEvent
  | VotingCreatedEvent
  | VotingUpdatedEvent
  | UpdatedVotesEvent
  | AddedBoardReactionEvent;
