import {Color} from "constants/colors";

export type BoardType = {
  id: string;
  name: string;
  showAuthors: boolean;
  showVoting: string;
  accessPolicy: string;
};

export type ColumnType = {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
};

export type NoteType = {
  id: string;
  author: string;
  text: string;
  position: {
    column: string;
    stack: string | null;
    rank: number;
  };
};

export type ParticipantType = {
  role: string;
  user: {
    id: string;
    name: string;
  };
};

export type VotingType = {
  votes: {
    votes: number;
    votesPerNote: [];
  };
};

export type BoardDataType = {
  board: BoardType;
  columns: ColumnType[];
  notes: NoteType[];
  participants: ParticipantType[];
  votings: VotingType[];
};
