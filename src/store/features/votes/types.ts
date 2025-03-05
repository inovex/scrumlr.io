export interface Vote {
  voting: string;
  note: string;
  user?: string;
}

export type VotesState = Vote[];
