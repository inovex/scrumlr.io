import {useTranslation} from "react-i18next";
import classNames from "classnames";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import {ReactComponent as CancelIcon} from "assets/icon-cancel.svg";
import {ReactComponent as FlagIcon} from "assets/icon-flag.svg";
import {ReactComponent as CheckIcon} from "assets/icon-check.svg";
import "./VoteDisplay.scss";
import {Tooltip} from "components/Tooltip/Tooltip";

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

  return (
    <div className={classNames("vote-display", {"vote-display--votes-depleted": usedVotes === possibleVotes})}>
      {usedVotes > 0 && <div className="vote-display__progress-bar" style={{right: `calc(72px - (${usedVotes} / ${possibleVotes}) * 72px)`}} />}
      <span title={t("VoteDisplay.tooltip", {remaining: possibleVotes - usedVotes, total: possibleVotes})}>
        {usedVotes} / {possibleVotes}
      </span>
      <Tooltip id="vote-display__tooltip" />
      <div className="vote-display__short-actions">
        {isAdmin && (
          <>
            <div className="short-actions__short-action">
              <button
                data-tooltip-id="vote-display__tooltip"
                data-tooltip-content={t("VoteDisplay.abortActionTooltip")}
                className="short-action__button"
                id="vote-display__abort-short-action"
                onClick={() => store.dispatch(Actions.abortVoting(voting!))}
              >
                <CancelIcon />
              </button>
            </div>
            <div className="short-actions__short-action">
              <button
                data-tooltip-id="vote-display__tooltip"
                data-tooltip-content={t("VoteDisplay.finishActionTooltip")}
                className="short-action__button"
                id="vote-display__finish-short-action"
                onClick={() => store.dispatch(Actions.closeVoting(voting!))}
              >
                <FlagIcon />
              </button>
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
            <Tooltip content={isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")} />
          </div>
        )}
      </div>
      <VoteIcon />
    </div>
  );
};
