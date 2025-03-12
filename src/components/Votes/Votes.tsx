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

  const {isAnonymous, participantsNames} = useAppSelector((state) => {
    // If it is available, retrieve the most recent previous voting entry
    const lastVoting = state.votings?.past?.[0];
    // If no voting data exists or it's anonymous, return default values
    if (!lastVoting || lastVoting.isAnonymous) {
      return {participantsNames: "", isAnonymous: true};
    }
    // Extract votes per note safely
    const votesPerNote = lastVoting.votes?.votesPerNote ?? {};
    const userVotes = votesPerNote[props.noteId]?.userVotes ?? [];
    // Retrieve every participant, including oneself
    const others = state.participants?.others ?? [];
    const selfParticipant = state.participants?.self;
    const participants = selfParticipant ? [selfParticipant, ...others] : others;
    // Extract participant names based on votes for the given noteId
    const names = userVotes
      .map((userVote) => participants.find((p) => p?.user.id === userVote.id)?.user.name ?? null)
      .filter((name): name is string => name !== null) // Ensure only valid strings remain
      .join(", ");
    return {participantsNames: names, isAnonymous: false};
  });

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
      {!voting && allPastVotes > 0 && (
        <VoteButtons.Remove
          noteId={props.noteId}
          numberOfVotes={allPastVotes}
          isAnonymous={isAnonymous}
          disabled
          colorClassName={props.colorClassName}
          participantNames={participantsNames}
        />
      )}
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
