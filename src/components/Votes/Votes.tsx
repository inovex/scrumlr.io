import {FC} from "react";
import {useTranslation} from "react-i18next";
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
  colorClassName?: string;
};

export const Votes: FC<VotesProps> = (props) => {
  const {t} = useTranslation();

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
        : 0)
  );
  const isModerator = useAppSelector((state) => ["OWNER", "MODERATOR"].some((role) => role === state.participants!.self?.role));
  const boardLocked = useAppSelector((state) => state.board.data!.isLocked);

  const addVotesDisabledReason = (): string => {
    if (!voting) return "";

    if (ongoingVotes.total === voting.voteLimit) {
      return t("Votes.VoteLimitReached");
    }
    if (ongoingVotes.note > 0 && !voting.allowMultipleVotes) {
      return t("Votes.MultipleVotesNotAllowed");
    }

    return "";
  };

  /**
   * If there's no active voting going on and there are no casted votes for
   * this note from previous votings, we don't need to render anything.
   */
  if (!voting && allPastVotes === 0) {
    return null;
  }

  return voting || allPastVotes > 0 ? (
    <div role="none" className={classNames("votes", props.className)} onClick={(e) => e.stopPropagation()}>
      {/* standard display for votes */}
      {!voting && allPastVotes > 0 && <VoteButtons.Remove noteId={props.noteId} numberOfVotes={allPastVotes} disabled colorClassName={props.colorClassName} />}
      {/* display for votes when voting is open */}
      {voting && ongoingVotes.note > 0 && (
        <VoteButtons.Remove disabled={boardLocked && !isModerator} noteId={props.noteId} numberOfVotes={ongoingVotes.note} colorClassName={props.colorClassName} />
      )}
      {voting && (isModerator || !boardLocked) && (
        <VoteButtons.Add
          noteId={props.noteId}
          disabled={ongoingVotes.total === voting.voteLimit || (ongoingVotes.note > 0 && !voting.allowMultipleVotes)}
          disabledReason={addVotesDisabledReason()}
          colorClassName={props.colorClassName}
        />
      )}
    </div>
  ) : null;
};
