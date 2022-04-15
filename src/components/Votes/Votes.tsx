import {useAppSelector} from "store";
import "./Votes.scss";
import classNames from "classnames";
import {VFC} from "react";
import {TabIndex} from "constants/tabIndex";
import {VoteButtons} from "./VoteButtons";

type VotesProps = {
  className?: string;
  noteId: string;
  tabIndex?: number;
};

export const Votes: VFC<VotesProps> = (props) => {
  const voting = useAppSelector((state) => state.votings.open);
  const currentUserVotes = useAppSelector(
    (state) => state.votes.filter((v) => v.voting === state.votings.open?.id || v.voting === state.board.data?.showVoting).filter((v) => v.note === props.noteId).length
  );
  const allPastVotes = useAppSelector(
    (state) =>
      (state.votings.past[0]?.votes?.votesPerNote[props.noteId]?.total ?? 0) +
      state.notes.filter((n) => n.position.stack === props.noteId).reduce((sum, curr) => sum + (state.votings.past[0]?.votes?.votesPerNote[curr.id]?.total ?? 0), 0)
  );
  const showAddVoteButton = voting && (voting?.allowMultipleVotes || currentUserVotes === 0);

  return (
    <div className={classNames("votes", props.className)}>
      {voting && currentUserVotes > 0 && (
        <VoteButtons.Remove {...props} activeVoting={!!voting} tabIndex={props.tabIndex ? props.tabIndex + 1 : TabIndex.default} ownVotes={currentUserVotes} votes={allPastVotes} />
      )}
      {!voting && allPastVotes > 0 && (
        <VoteButtons.Remove {...props} activeVoting={!!voting} tabIndex={props.tabIndex ? props.tabIndex + 1 : TabIndex.default} ownVotes={currentUserVotes} votes={allPastVotes} />
      )}
      {showAddVoteButton && <VoteButtons.Add {...props} tabIndex={props.tabIndex ? props.tabIndex + 2 : TabIndex.default} disabled={currentUserVotes === voting?.voteLimit} />}
    </div>
  );
};
