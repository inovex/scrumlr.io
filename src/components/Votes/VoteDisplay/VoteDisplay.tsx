import "./VoteDisplay.scss";
import {useTranslation} from "react-i18next";
import {ReactComponent as VoteIcon} from "assets/icon-vote.svg";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";

type VoteDisplayProps = {
  usedVotes: number;
  possibleVotes: number;
};

export const VoteDisplay = ({usedVotes, possibleVotes}: VoteDisplayProps) => {
  const {t} = useTranslation();
  const voting = useAppSelector((state) => state.votings.open?.id);
  const isModerator = useAppSelector((state) => state.participants?.self.role === "OWNER" || state.participants?.self.role === "MODERATOR");

  return (
    <div className="vote-display">
      {usedVotes > 0 && <div className="vote-display__progress-bar" style={{right: `calc(72px - (${usedVotes} / ${possibleVotes}) * 72px)`}} />}
      <span title={t("VoteDisplay.tooltip", {remaining: possibleVotes - usedVotes, total: possibleVotes})}>
        {usedVotes} / {possibleVotes}
      </span>
      {isModerator && (
        <div className="vote-display__short-actions">
          <div className="short-actions__button-wrapper">
            <button onClick={() => store.dispatch(Actions.closeVoting(voting!))}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392l1.657-.348a6.449 6.449 0 014.271.572 7.948 7.948 0 005.965.524l2.078-.64A.75.75 0 0018 12.25v-8.5a.75.75 0 00-.904-.734l-2.38.501a7.25 7.25 0 01-4.186-.363l-.502-.2a8.75 8.75 0 00-5.053-.439l-1.475.31V2.75z" />
              </svg>
            </button>
            <span>Finish</span>
          </div>
          <div className="short-actions__button-wrapper">
            <button onClick={() => store.dispatch(Actions.abortVoting(voting!))}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
            <span>Abort</span>
          </div>
        </div>
      )}
      <VoteIcon />
    </div>
  );
};
