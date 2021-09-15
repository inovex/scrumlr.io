export interface VoteServerModel extends Parse.Object {
  board: Parse.Object;
  note: Parse.Object;
  user: Parse.Object;
  votingIteration: number;
}

export interface VoteClientModel {
  /** The id of the note or `undefined` if yet to be persisted. */
  id?: string;

  board: string;

  note: string;

  user: string;

  votingIteration: number;
}

export const mapVoteServerToClientModel = (vote: VoteServerModel): VoteClientModel => ({
  id: vote.id,
  board: vote.get("board").id,
  note: vote.get("note").id,
  user: vote.get("user").id,
  votingIteration: vote.get("votingIteration"),
});
