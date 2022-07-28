import {Color} from "constants/colors";

export interface BoardType {
  id: string;
  name: string;
  showAuthors: boolean;
  showVoting: string;
  accessPolicy: string;
}

export interface ColumnType {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
}

export interface NoteType {
  id: string;
  author: string;
  text: string;
  position: {
    column: string;
    stack: string | null;
    rank: number;
  };
}

export interface ParticipantType {
  role: string;
  user: {
    id: string;
    name: string;
  };
}

export interface VotingType {
  votes: {
    votes: number;
    votesPerNote: [];
  };
}

export interface BoardDataType {
  board: BoardType;
  columns: ColumnType[];
  notes: NoteType[];
  participants: ParticipantType[];
  votings: VotingType[];
}
