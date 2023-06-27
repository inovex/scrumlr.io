import {useTranslation} from "react-i18next";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import {ReactComponent as CancelIcon} from "assets/icon-cancel.svg";
import {ReactComponent as FlagIcon} from "assets/icon-flag.svg";
import "./VoteDisplay.scss";

type VoteDisplayProps = {
  usedVotes: number;
  possibleVotes: number;
};

export const VoteDisplay = ({usedVotes, possibleVotes}: VoteDisplayProps) => {
  const {t} = useTranslation();
  const voting = useAppSelector((state) => state.votings.open?.id);
  const isModerator = useAppSelector((state) => state.participants?.self.role === "OWNER" || state.participants?.self.role === "MODERATOR");
  const onboardingPhase = useAppSelector((state) => state.onboarding.phase);
  const onboardingStep = useAppSelector((state) => state.onboarding.step);

  return (
    <div className="vote-display">
      {usedVotes > 0 && <div className="vote-display__progress-bar" style={{right: `calc(72px - (${usedVotes} / ${possibleVotes}) * 72px)`}} />}
      <span title={t("VoteDisplay.tooltip", {remaining: possibleVotes - usedVotes, total: possibleVotes})}>
        {usedVotes} / {possibleVotes}
      </span>
      {isModerator && (
        <div className="vote-display__short-actions">
          <div className="short-actions__button-wrapper">
            <button
              onClick={() => {
                if (onboardingPhase === "board_insights" && onboardingStep === 2) {
                  store.dispatch(Actions.setFakeVotesOpen(true));
                  store.dispatch(Actions.setInUserTask(false));
                  store.dispatch(Actions.incrementStep());
                }
                store.dispatch(Actions.closeVoting(voting!));
              }}
            >
              <FlagIcon />
            </button>
            <span>{t("VoteDisplay.finishActionTooltip")}</span>
          </div>
          <div className="short-actions__button-wrapper">
            <button onClick={() => store.dispatch(Actions.abortVoting(voting!))}>
              <CancelIcon />
            </button>
            <span>{t("VoteDisplay.abortActionTooltip")}</span>
          </div>
        </div>
      )}
      <VoteIcon />
    </div>
  );
};
