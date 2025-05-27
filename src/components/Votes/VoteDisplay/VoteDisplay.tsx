import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {useAppDispatch, useAppSelector} from "store";
import {Voting, Close, FlagFinish, MarkAsDone} from "components/Icon";
import "./VoteDisplay.scss";
import {closeVoting, setUserReadyStatus} from "store/features";

type VoteDisplayProps = {
  usedVotes: number;
  possibleVotes: number;
};

export const VoteDisplay = ({usedVotes, possibleVotes}: VoteDisplayProps) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const me = useAppSelector((state) => state.participants!.self)!;
  const voting = useAppSelector((state) => state.votings.open?.id);
  const isAdmin = me.role === "OWNER" || me.role === "MODERATOR";
  const isReady = me.ready;

  return (
    <div className={classNames("vote-display", {"vote-display--votes-depleted": usedVotes === possibleVotes})}>
      {usedVotes > 0 && <div className="vote-display__progress-bar" style={{right: `calc(72px - (${usedVotes} / ${possibleVotes}) * 72px)`}} />}
      <span title={t("VoteDisplay.tooltip", {remaining: possibleVotes - usedVotes, total: possibleVotes})}>
        {usedVotes} / {possibleVotes}
      </span>
      <ul className="vote-display__short-actions">
        {isAdmin && (
          <li className="short-actions__short-action">
            <button
              aria-label={t("VoteDisplay.finishActionTooltip")}
              data-tooltip-id="info-bar__tooltip"
              data-tooltip-content={t("VoteDisplay.finishActionTooltip")}
              className="short-action__button"
              onClick={() => dispatch(closeVoting(voting!))}
            >
              <FlagFinish className="short-action__flag-icon" />
            </button>
          </li>
        )}
        <li className="short-actions__short-action">
          <button
            aria-label={isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")}
            data-tooltip-id="info-bar__tooltip"
            data-tooltip-content={isReady ? t("MenuBars.unmarkAsDone") : t("MenuBars.markAsDone")}
            className={classNames("short-action__button", {"short-action__button--ready": isReady})}
            onClick={() => dispatch(setUserReadyStatus({userId: me.user.id, ready: !isReady}))}
          >
            <MarkAsDone className="short-action__check-icon" />
            <Close className="short-action__cancel-icon" />
          </button>
        </li>
      </ul>
      <Voting />
    </div>
  );
};
