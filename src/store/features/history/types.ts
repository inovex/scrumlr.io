import {AccessPolicy} from "../board/types";
import {Column} from "../columns/types";
import {ParticipantRole} from "../participants/types";

// a board shown in the History list (one of the user's past board sessions).
export type HistoryBoard = {
  id: string;
  name: string;
  description: string;
  accessPolicy: AccessPolicy;
  columns: Column[];
  participants: number;
  createdAt: Date;
  modifiedAt: Date;
  notes: number;
  isLocked: boolean;
  userRole: ParticipantRole;
  favourite: boolean;
};

export type HistoryState = HistoryBoard[];

// raw server shape returned by GET /boards
export type BoardOverview = {
  board: {
    id: string;
    name?: string;
    description?: string;
    accessPolicy: AccessPolicy;
    isLocked: boolean;
    createdAt: string;
    lastModifiedAt: string;
  };
  columns: Column[];
  participants: number;
  role: ParticipantRole;
  favourite: boolean;
  noteCount: number;
};
