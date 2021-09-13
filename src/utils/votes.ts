import Parse from "parse";
import {VoteClientModel} from "types/vote";

export const filterVotes = (votes: VoteClientModel[], activeVoting: boolean) => votes.filter((vote) => !activeVoting || vote.user === Parse.User.current()?.id);
