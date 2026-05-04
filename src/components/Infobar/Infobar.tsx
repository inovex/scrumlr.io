import {useTranslation} from "react-i18next";
import {Link} from "react-router";
import _ from "underscore";
import {HiddenIcon, ShareIcon, VisibleIcon} from "components/Icon";
import {Timer} from "components/Timer";
import {Tooltip} from "components/Tooltip";
import {VoteDisplay} from "components/Votes/VoteDisplay";
import {useAppSelector} from "store";
import "./Infobar.scss";

export const InfoBar = () => {
  const {t} = useTranslation();
  const viewer = useAppSelector((state) => state.participants!.self);
  const focusInitiator = useAppSelector((state) => state.participants?.focusInitiator);

  const state = useAppSelector(
    (applicationState) => ({
      startTime: applicationState.board.data?.timerStart,
      endTime: applicationState.board.data?.timerEnd,
      activeVoting: Boolean(applicationState.votings.open),
      isVotingAnonymous: applicationState.votings.open?.isAnonymous,
      possibleVotes: applicationState.votings.open?.voteLimit,
      usedVotes: applicationState.votes.filter((v) => v.voting === applicationState.votings.open?.id).length,
      sharedNote: applicationState.board.data?.sharedNote,
    }),
    _.isEqual
  );

  return (
    <aside className="info-bar">
      {state.activeVoting && state.isVotingAnonymous && (
        <span id="info-bar__voting-anonymous" className="info-bar__icon">
          <HiddenIcon />
        </span>
      )}
      {state.activeVoting && !state.isVotingAnonymous && (
        <span id="info-bar__voting-not-anonymous" className="info-bar__icon">
          <VisibleIcon />
        </span>
      )}
      {state.startTime && state.endTime && <Timer startTime={state.startTime} endTime={state.endTime} />}

      {state.activeVoting && <VoteDisplay usedVotes={state.usedVotes} possibleVotes={state.possibleVotes!} />}

      {state.sharedNote && viewer?.user.id !== focusInitiator?.user.id && (
        <Link
          id="info-bar__return-to-shared-note"
          aria-label={t("InfoBar.ReturnToPresentedNote")}
          className="info-bar__return-to-shared-note-button"
          to={`note/${state.sharedNote}/stack`}
        >
          <ShareIcon />
        </Link>
      )}
      <Tooltip anchorId="info-bar__voting-anonymous" color="backlog-blue">
        {t("InfoBar.VotingIsAnonymous")}
      </Tooltip>
      <Tooltip anchorId="info-bar__voting-not-anonymous" color="backlog-blue">
        {t("InfoBar.VotingIsNotAnonymous")}
      </Tooltip>
      <Tooltip anchorId="info-bar__return-to-shared-note" color="backlog-blue">
        {t("InfoBar.ReturnToPresentedNote")}
      </Tooltip>
    </aside>
  );
};
