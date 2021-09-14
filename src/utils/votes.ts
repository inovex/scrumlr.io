import Parse from "parse";
import {VoteClientModel} from "types/vote";

export const filterVotes = (votes: VoteClientModel[], activeVoting: boolean, showVotes: boolean) =>
  votes.filter((vote) => !activeVoting || showVotes || vote.user === Parse.User.current()?.id);
