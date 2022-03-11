import {useAppSelector} from "store";
import "./Votes.scss";
import classNames from "classnames";
import {FC} from "react";
import {TabIndex} from "constants/tabIndex";
import {VoteButtons} from "./VoteButtons";
import {Vote} from "../../types/vote";

type VotesProps = {
  className?: string;
  noteId: string;
  votes: number;
  activeVoting: boolean;
  tabIndex?: number;
  userVotes: Vote[];
};

export const Votes: FC<VotesProps> = (props) => {
  const state = useAppSelector((state) => ({
    voting: state.votings.open,
  }));
  const showAddVoteButton = props.activeVoting && (state.voting?.allowMultipleVotes || (!state.voting?.allowMultipleVotes && props.userVotes.length === 0));

  return (
    <div className={classNames("votes", props.className)}>
      {props.activeVoting && props.userVotes.length > 0 && (
        <VoteButtons.Remove {...props} tabIndex={props.tabIndex ? props.tabIndex + 1 : TabIndex.default} ownVotes={props.userVotes} />
      )}
      {!props.activeVoting && props.votes > 0 && <VoteButtons.Remove {...props} tabIndex={props.tabIndex ? props.tabIndex + 1 : TabIndex.default} ownVotes={props.userVotes} />}
      {showAddVoteButton && (
        <VoteButtons.Add {...props} tabIndex={props.tabIndex ? props.tabIndex + 2 : TabIndex.default} disabled={props.userVotes.length === state.voting?.voteLimit} />
      )}
    </div>
  );
};
