export type VoteBase = {
  voting: string;
  note: string;
  isAnonymous: true;
};

export type VoteWithUser = {
  voting: string;
  note: string;
  isAnonymous: false;
  user: string;
};

export type Vote = VoteBase | VoteWithUser;

export interface VotesState {
  data: Vote[];
}
