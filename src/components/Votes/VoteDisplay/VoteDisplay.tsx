import "./VoteDisplay.scss";
import {useTranslation} from "react-i18next";
import {FC} from "react";

type VoteDisplayProps = {
  usedVotes: number;
  possibleVotes: number;
};

export const VoteDisplay: FC<VoteDisplayProps> = ({usedVotes, possibleVotes}) => {
  const {t} = useTranslation();

  return (
    <div className="vote-display">
      <span title={t("VoteDisplay.tooltip", {remaining: possibleVotes - usedVotes, total: possibleVotes})}>
        {usedVotes} / {possibleVotes}
      </span>
    </div>
  );
};
