import classNames from "classnames";
import _ from "underscore";
import {useAppSelector} from "store";
import {VoteButtons} from "./VoteButtons";
import "./Votes.scss";

type VotesProps = {
  className?: string;
  noteId: string;
  // Aggregate the votes of the child notes
  aggregateVotes?: boolean;
};

export const Votes = ({className, noteId, aggregateVotes}: VotesProps) => {
  const voting = useAppSelector((state) => state.votings.open);
  const ongoingVotes = useAppSelector(
    (state) => ({
      note: state.votes.filter((v) => v.voting === state.votings.open?.id || v.voting === state.board.data?.showVoting).filter((v) => v.note === noteId).length,
      total: state.votes.filter((v) => v.voting === state.votings.open?.id || v.voting === state.board.data?.showVoting).length,
    }),
    _.isEqual
  );
  const allPastVotes = useAppSelector(
    (state) =>
      (state.votings.past[0]?.votes?.votesPerNote[noteId]?.total ?? 0) +
      (aggregateVotes
        ? state.notes.filter((n) => n.position.stack === noteId).reduce((sum, curr) => sum + (state.votings.past[0]?.votes?.votesPerNote[curr.id]?.total ?? 0), 0)
        : 0)
  );

  return (
    <div role="none" className={classNames("votes", className)} onClick={(e) => e.stopPropagation()}>
      {!voting && allPastVotes > 0 && (
        <VoteButtons.Remove noteId={noteId} disabled>
          {allPastVotes}
        </VoteButtons.Remove>
      )}
      {voting && ongoingVotes.note > 0 && <VoteButtons.Remove noteId={noteId}>{ongoingVotes.note}</VoteButtons.Remove>}
      {voting && <VoteButtons.Add noteId={noteId} disabled={ongoingVotes.total === voting.voteLimit || (ongoingVotes.note > 0 && !voting.allowMultipleVotes)} />}
    </div>
  );
};
