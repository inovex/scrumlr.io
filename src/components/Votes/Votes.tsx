import {useAppSelector} from "store";
import "./Votes.scss";
import classNames from "classnames";
import {VoteClientModel} from "types/vote";
import Parse from "parse";
import {FC} from "react";
import {VoteButtons} from "./VoteButtons";

type VotesProps = {
  className?: string;
  noteId: string;
  votes: VoteClientModel[];
  activeVoting: boolean;
};

export const Votes: FC<VotesProps> = (props: VotesProps) => {
  const voteConfiguration = useAppSelector((state) => state.voteConfiguration);
  const ownVotes = props.votes.filter((vote) => vote.user === Parse.User.current()?.id);
  const showAddVoteButton = props.activeVoting && (voteConfiguration?.allowMultipleVotesPerNote || (!voteConfiguration?.allowMultipleVotesPerNote && ownVotes.length < 1));

  return (
    <div className={classNames("votes", props.className)}>
      {props.votes.length > 0 && <VoteButtons.Remove {...props} ownVotes={ownVotes} />}
      {showAddVoteButton && <VoteButtons.Add {...props} />}
    </div>
  );
};
