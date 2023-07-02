import {useTranslation} from "react-i18next";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import {ReactComponent as CancelIcon} from "assets/icon-cancel.svg";
import {ReactComponent as FlagIcon} from "assets/icon-flag.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import "./VoteDisplay.scss";

type VoteDisplayProps = {
  usedVotes: number;
  possibleVotes: number;
};

export const VoteDisplay = ({usedVotes, possibleVotes}: VoteDisplayProps) => {
  const {t} = useTranslation();
  const me = useAppSelector((state) => state.participants!.self);
  const voting = useAppSelector((state) => state.votings.open?.id);
  const isAdmin = me.role === "OWNER" || me.role === "MODERATOR";
  const isReady = me.ready;
  // const onboardingPhase = useAppSelector((state) => state.onboarding.phase);
  // const onboardingStep = useAppSelector((state) => state.onboarding.step);

  return (
    <div className={classNames("vote-display", {"vote-display--votes-depleted": usedVotes === possibleVotes})}>
      {usedVotes > 0 && <div className="vote-display__progress-bar" style={{right: `calc(72px - (${usedVotes} / ${possibleVotes}) * 72px)`}} />}
      <span title={t("VoteDisplay.tooltip", {remaining: possibleVotes - usedVotes, total: possibleVotes})}>
        {usedVotes} / {possibleVotes}
      </span>
      <div className="vote-display__short-actions">
        {isAdmin && (
          <>
            <div className="short-actions__short-action">
              <button
                aria-label={t("VoteDisplay.finishActionTooltip")}
                className="short-action__button"
                onClick={() => {
                  // if (onboardingPhase === "board_insights" && onboardingStep === 3) {
                  //   store.dispatch(Actions.setFakeVotesOpen(true));
                  //   store.dispatch(Actions.setInUserTask(false));
                  //   store.dispatch(Actions.switchPhaseStep("board_insights", 4));
                  // }
                  store.dispatch(Actions.closeVoting(voting!));
                }}
              >
                <FlagIcon />
              </button>
              <span className="short-action__tooltip">{t("VoteDisplay.finishActionTooltip")}</span>
            </div>
            <div className="short-actions__short-action">
              <button aria-label={t("VoteDisplay.abortActionTooltip")} className="short-action__button" onClick={() => store.dispatch(Actions.abortVoting(voting!))}>
                <CancelIcon />
              </button>
              <span className="short-action__tooltip">{t("VoteDisplay.abortActionTooltip")}</span>
            </div>
          </>
        )}
        {!isAdmin && (
          <div className="short-actions__short-action">
            <button
              aria-label={isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")}
              className={classNames("short-action__button", {"short-action__button--ready": isReady}, {"short-action__button--unready": !isReady})}
              onClick={() => store.dispatch(Actions.setUserReadyStatus(me!.user.id, !isReady))}
            >
              <CheckIcon className="short-action__check-icon" />
              <CancelIcon className="short-action__cancel-icon" />
            </button>
            <span className="short-action__tooltip">{isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")}</span>
          </div>
        )}
      </div>
      <VoteIcon />
    </div>
  );
};
