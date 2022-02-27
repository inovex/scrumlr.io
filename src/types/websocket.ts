import {BoardServerModel} from "./board";
import {Column} from "./column";
import {Participant} from "./participant";
import {Note} from "./note";

export interface BoardInitEvent {
  type: "INIT";
  data: {
    board: BoardServerModel;
    columns: Column[];
    notes?: {}[];
    votings?: {}[];
    votes?: {}[];
    participants: Participant[];
    requests?: {}[];
  };
}

export interface BoardUpdateEvent {
  type: "BOARD_UPDATED";
  data: BoardServerModel;
}

export interface BoardDeletedEvent {
  type: "BOARD_DELETED";
}

export interface UpdatedColumnsEvent {
  type: "COLUMNS_UPDATED";
  data: Column[];
}

export interface UpdatedNotesEvent {
  type: "NOTES_UPDATED";
  data: Note[];
}

/*
REQUEST_CREATED	Fired when someone wants to gain access to a board.
REQUEST_UPDATED	If a join request was accepted or rejected this event will be fired.
PARTICIPANT_CREATED	This event will include a new participant of a board.
PARTICIPANT_UPDATED	If a participant changes the ready state or goes on or offline (the connected attribute changes) this event will be fired.
PARTICIPANTS_UPDATED	Since moderators can change settings of all participants at once (e.g. the ready state) this message will include an array of all participants with their latest settings.
VOTING_CREATED	Fired once a new voting iteration is created. The data includes the voting settings.
VOTING_UPDATED	Fired once a voting iteration is closed or aborted. In the first case the data will also include the voting results according to the settings of the voting.
 */

export type ServerEvent = BoardInitEvent | BoardUpdateEvent | BoardDeletedEvent | UpdatedColumnsEvent | UpdatedNotesEvent;
