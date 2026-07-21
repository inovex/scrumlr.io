import {AccessPolicy} from "../board/types";
import {Column} from "../columns/types";
import {ParticipantRole} from "../participants/types";

// a board shown in the History list (one of the user's past board sessions).
// `columns` are full column objects (title, color, order via index), mirroring the backend BoardOverview.Columns.
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
  favourite: boolean; // todo add to board table schema
};

export type HistoryState = HistoryBoard[];
