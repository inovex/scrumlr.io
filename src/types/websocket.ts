import {Board} from "./board";
import {Column} from "./column";
import {Participant} from "./participant";
import {Note} from "./note";
import {Vote} from "./vote";
import {Voting} from "./voting";
import {Request} from "./request";
import {Assignment} from "./assignment";
import {BoardReactionType} from "./reaction";

export interface BoardInitEvent {
  type: "INIT";
  data: {
    board: Board;
    columns: Column[];
    notes?: Note[];
    votings?: Voting[];
    votes?: Vote[];
    participants: Participant[];
    requests?: Request[];
    assignments?: Assignment[];
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

export interface DeletedNoteEvent {
  type: "NOTE_DELETED";
  data: {
    note: string;
    deleteStack: boolean;
  };
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

export interface CreatedAssignmentEvent {
  type: "ASSIGNMENT_CREATED";
  data: Assignment;
}
export interface DeletedAssignmentEvent {
  type: "ASSIGNMENT_DELETED";
  data: string;
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
  | RequestCreatedEvent
  | RequestUpdatedEvent
  | ParticipantCreatedEvent
  | ParticipantUpdatedEvent
  | ParticipantsUpdatedEvent
  | VotingCreatedEvent
  | VotingUpdatedEvent
  | UpdatedVotesEvent
  | CreatedAssignmentEvent
  | DeletedAssignmentEvent
  | AddedBoardReactionEvent;
