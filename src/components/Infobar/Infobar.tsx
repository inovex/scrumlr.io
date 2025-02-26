import {useTranslation} from "react-i18next";
import {Link} from "react-router";
import _ from "underscore";
import {Hidden, Share, Visible} from "components/Icon";
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
        <span data-tooltip-id="info-bar__tooltip" data-tooltip-content={t("InfoBar.VotingIsAnonymous")}>
          <Hidden />
        </span>
      )}
      {state.activeVoting && !state.isVotingAnonymous && (
        <span data-tooltip-id="info-bar__tooltip" data-tooltip-content={t("InfoBar.VotingIsNotAnonymous")}>
          <Visible />
        </span>
      )}
      {state.startTime && state.endTime && <Timer startTime={state.startTime} endTime={state.endTime} />}
      {state.activeVoting && <VoteDisplay usedVotes={state.usedVotes} possibleVotes={state.possibleVotes!} />}
      {state.sharedNote && viewer?.user.id !== focusInitiator?.user.id && (
        <Link
          aria-label={t("InfoBar.ReturnToPresentedNote")}
          className="info-bar__return-to-shared-note-button"
          data-tooltip-id="info-bar__tooltip"
          data-tooltip-content={t("InfoBar.ReturnToPresentedNote")}
          to={`note/${state.sharedNote}/stack`}
        >
          <Share />
        </Link>
      )}
      <Tooltip id="info-bar__tooltip" />
    </aside>
  );
};
