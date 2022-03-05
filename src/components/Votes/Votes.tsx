import {useAppSelector} from "store";
import "./Votes.scss";
import classNames from "classnames";
import {Vote} from "types/vote";
import {FC} from "react";
import {TabIndex} from "constants/tabIndex";
import {VoteButtons} from "./VoteButtons";

type VotesProps = {
  className?: string;
  noteId: string;
  votes: Vote[];
  activeVoting: boolean;
  tabIndex?: number;
  usedVotesAsUser: number;
};

export const Votes: FC<VotesProps> = (props) => {
  const state = useAppSelector((state) => ({
    voting: state.votings.open,
    votes: state.votes,
  }));
  const ownNoteVotes = state.votes;
  const showAddVoteButton = props.activeVoting && (state.voting?.allowMultipleVotes || (!state.voting?.allowMultipleVotes && ownNoteVotes.length === 0));

  return (
    <div className={classNames("votes", props.className)}>
      {props.votes.length > 0 && <VoteButtons.Remove {...props} tabIndex={props.tabIndex ? props.tabIndex + 1 : TabIndex.default} ownVotes={ownNoteVotes} />}
      {showAddVoteButton && (
        <VoteButtons.Add {...props} tabIndex={props.tabIndex ? props.tabIndex + 2 : TabIndex.default} disabled={props.usedVotesAsUser === state.voting?.voteLimit} />
      )}
    </div>
  );
};
