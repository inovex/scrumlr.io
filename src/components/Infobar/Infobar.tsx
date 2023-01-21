import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import {Timer} from "components/Timer";
import {VoteDisplay} from "components/Votes/VoteDisplay";
import ReactDOM from "react-dom";
import _ from "underscore";
import {useAppSelector} from "store";
import {TooltipButton} from "components/TooltipButton/TooltipButton";
import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import "./Infobar.scss";

export const InfoBar = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const viewer = useAppSelector((state) => state.participants!.self);
  const focusInitiator = useAppSelector((state) => state.participants?.focusInitiator);

  const state = useAppSelector(
    (applicationState) => ({
      startTime: applicationState.board.data?.timerStart,
      endTime: applicationState.board.data?.timerEnd,
      activeVoting: Boolean(applicationState.votings.open),
      possibleVotes: applicationState.votings.open?.voteLimit,
      usedVotes: applicationState.votes.filter((v) => v.voting === applicationState.votings.open?.id).length,
      sharedNote: applicationState.board.data?.sharedNote,
    }),
    _.isEqual
  );

  return ReactDOM.createPortal(
    <aside className="info-bar">
      {state.startTime && state.endTime && <Timer startTime={state.startTime} endTime={state.endTime} />}
      {state.activeVoting && <VoteDisplay usedVotes={state.usedVotes} possibleVotes={state.possibleVotes!} />}
      {state.sharedNote && viewer.user.id !== focusInitiator?.user.id && (
        <TooltipButton
          className="info-bar__return-to-presented-note-button"
          icon={ShareIcon}
          direction="right"
          label={t("InfoBar.ReturnToPresentedNote")}
          onClick={() => navigate(`note/${state.sharedNote}/stack`)}
        />
      )}
    </aside>,
    document.getElementById("root")!
  );
};
