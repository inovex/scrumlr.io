import {FC} from "react";
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

export const Votes: FC<VotesProps> = (props) => {
  const voting = useAppSelector((state) => state.votings.open);
  const ongoingVotes = useAppSelector(
    (state) => ({
      note: state.votes.filter((v) => v.voting === state.votings.open?.id || v.voting === state.board.data?.showVoting).filter((v) => v.note === props.noteId).length,
      total: state.votes.filter((v) => v.voting === state.votings.open?.id || v.voting === state.board.data?.showVoting).length,
    }),
    _.isEqual
  );
  const allPastVotes = useAppSelector(
    (state) =>
      (state.votings.past[0]?.votes?.votesPerNote[props.noteId]?.total ?? 0) +
      (props.aggregateVotes
        ? state.notes.filter((n) => n.position.stack === props.noteId).reduce((sum, curr) => sum + (state.votings.past[0]?.votes?.votesPerNote[curr.id]?.total ?? 0), 0)
        : 0) +
      (state.onboarding.fakeVotesOpen ? state.onboardingNotes.find((on) => on.id === props.noteId)?.votes ?? 0 : 0)
  );

  /**
   * If there's no active voting going on and there are no casted votes for
   * this note from previous votings, we don't need to render anything.
   */
  if (!voting && allPastVotes === 0) {
    return null;
  }

  return (
    <div role="none" className={classNames("votes", props.className)} onClick={(e) => e.stopPropagation()}>
      {!voting && allPastVotes > 0 && (
        <VoteButtons.Remove noteId={props.noteId} disabled>
          {allPastVotes}
        </VoteButtons.Remove>
      )}
      {voting && ongoingVotes.note > 0 && <VoteButtons.Remove noteId={props.noteId}>{ongoingVotes.note}</VoteButtons.Remove>}
      {voting && <VoteButtons.Add noteId={props.noteId} disabled={ongoingVotes.total === voting.voteLimit || (ongoingVotes.note > 0 && !voting.allowMultipleVotes)} />}
    </div>
  );
};
