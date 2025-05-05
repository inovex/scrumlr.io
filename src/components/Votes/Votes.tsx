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
    const lastVoting = state.votings?.past?.[0];
    if (!lastVoting || lastVoting.isAnonymous) {
      return {participantsNames: "", isAnonymous: true};
    }

    const votesPerNote = lastVoting.votes?.votesPerNote ?? {};

    // Aggregate user votes for a note and its stacked child notes, then deduplicate by vote ID to display unique user names
    let userVotes = (votesPerNote[props.noteId]?.userVotes ?? []).map((v) => ({id: v.id}));

    if (props.aggregateVotes) {
      const childVotes = state.notes
        .filter((n) => n.position.stack === props.noteId)
        .reduce(
          (acc, curr) => {
            const childUserVotes = (votesPerNote[curr.id]?.userVotes ?? []).map((v) => ({id: v.id}));
            return acc.concat(childUserVotes);
          },
          [] as Array<{id: string}>
        );
      userVotes = userVotes.concat(childVotes);
    }

    const uniqueUserVotes = _.uniq(userVotes, (vote) => vote.id);

    const others = state.participants?.others ?? [];
    const selfParticipant = state.participants.self!;
    const participants = [selfParticipant, ...others];

    const names = uniqueUserVotes
      .map((userVote) => participants.find((p) => p.user.id === userVote.id))
      .filter((p) => p !== undefined)
      .map((p) => p!.user.name)
      .toSorted((a, b) => a.localeCompare(b))
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

  if (!voting && allPastVotes === 0) {
    return null;
  }

  return voting || allPastVotes > 0 ? (
    <div role="none" className={classNames("votes", props.className)} onClick={(e) => e.stopPropagation()}>
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
