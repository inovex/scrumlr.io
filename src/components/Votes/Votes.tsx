import {useAppSelector} from "store";
import "./Votes.scss";
import classNames from "classnames";
import {VoteClientModel} from "types/vote";
import Parse from "parse";
import {FC} from "react";
import {TabIndex} from "constants/tabIndex";
import {VoteButtons} from "./VoteButtons";

type VotesProps = {
  className?: string;
  noteId: string;
  votes: VoteClientModel[];
  activeVoting: boolean;
  tabIndex?: number;
  usedVotesAsUser: number;
};

export const Votes: FC<VotesProps> = (props) => {
  const voteConfiguration = useAppSelector((state) => state.voteConfiguration);
  const ownNoteVotes = props.votes.filter((vote) => vote.user === Parse.User.current()?.id);
  const showAddVoteButton = props.activeVoting && (voteConfiguration?.allowMultipleVotesPerNote || (!voteConfiguration?.allowMultipleVotesPerNote && ownNoteVotes.length === 0));

  return (
    <div className={classNames("votes", props.className)}>
      {props.votes.length > 0 && <VoteButtons.Remove {...props} tabIndex={props.tabIndex ? props.tabIndex + 1 : TabIndex.default} ownVotes={ownNoteVotes} />}
      {showAddVoteButton && (
        <VoteButtons.Add {...props} tabIndex={props.tabIndex ? props.tabIndex + 2 : TabIndex.default} disabled={props.usedVotesAsUser === voteConfiguration.voteLimit} />
      )}
    </div>
  );
};
