import {FC, useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {DotButton} from "components/DotButton";
import {Minus} from "components/Icon";
import "./RemoveVoteButton.scss";
import {useAppDispatch} from "store";
import {deleteVote} from "store/features";

type RemoveVoteProps = {
  noteId: string;
  disabled?: boolean;
  numberOfVotes: number;
};

export const RemoveVoteButton: FC<RemoveVoteProps> = ({noteId, disabled, numberOfVotes}) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  const dispatchDeleteVote = () => {
    dispatch(deleteVote(noteId));
  };

  const [doBump, setDoBump] = useState(false);
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setDoBump(true);
  }, [numberOfVotes]);

  return (
    <DotButton
      title={disabled ? t("Votes.VotesOnNote", {votes: numberOfVotes}) : t("Votes.RemoveVote")}
      className={classNames("vote-button-remove", {bump: doBump})}
      disabled={disabled}
      onClick={dispatchDeleteVote}
      onAnimationEnd={() => {
        setDoBump(false);
      }}
      dataTooltipId="scrumlr-tooltip"
      dataTooltipContent={t("Votes.RemoveVote")}
    >
      <span className="vote-button-remove__folded-corner" />
      <Minus className="vote-button-remove__icon" />
      <span className="vote-button-remove__count">{numberOfVotes}</span>
    </DotButton>
  );
};
