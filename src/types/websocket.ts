import {Board} from "./board";
import {Column} from "./column";
import {Participant} from "./participant";
import {Note} from "./note";
import {Vote} from "./vote";
import {Voting} from "./voting";
import {Request} from "./request";

type BoardInitEvent = {
  type: "INIT";
  data: {
    board: Board;
    columns: Column[];
    notes?: Note[];
    votings?: Voting[];
    votes?: Vote[];
    participants: Participant[];
    requests?: Request[];
  };
};

type BoardUpdateEvent = {
  type: "BOARD_UPDATED";
  data: Board;
};

type BoardTimerUpdateEvent = {
  type: "BOARD_TIMER_UPDATED";
  data: Board;
};

type BoardDeletedEvent = {
  type: "BOARD_DELETED";
};

type UpdatedColumnsEvent = {
  type: "COLUMNS_UPDATED";
  data: Column[];
};

type DeletedColumnEvent = {
  type: "COLUMN_DELETED";
  data: string;
};

type UpdatedNotesEvent = {
  type: "NOTES_UPDATED";
  data: Note[];
};

type DeletedNoteEvent = {
  type: "NOTE_DELETED";
  data: string;
};

type RequestCreatedEvent = {
  type: "REQUEST_CREATED";
  data: Request;
};

type RequestUpdatedEvent = {
  type: "REQUEST_UPDATED";
  data: Request;
};

type ParticipantCreatedEvent = {
  type: "PARTICIPANT_CREATED";
  data: Participant;
};

type ParticipantUpdatedEvent = {
  type: "PARTICIPANT_UPDATED";
  data: Participant;
};

type ParticipantsUpdatedEvent = {
  type: "PARTICIPANTS_UPDATED";
  data: Participant[];
};

type VotingCreatedEvent = {
  type: "VOTING_CREATED";
  data: Voting;
};

type VotingUpdatedEvent = {
  type: "VOTING_UPDATED";
  data: {
    voting: Voting;
    notes?: Note[];
  };
};

type UpdatedVotesEvent = {
  type: "VOTES_UPDATED";
  data: Vote[];
};

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
  | UpdatedVotesEvent;
