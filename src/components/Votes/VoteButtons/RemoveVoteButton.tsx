import {FC, useEffect, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {Actions} from "store/action";
import {DotButton} from "components/DotButton";
import {ReactComponent as RemoveIcon} from "assets/icon-remove.svg";
import "./RemoveVoteButton.scss";

type RemoveVoteProps = {
  noteId: string;
  disabled?: boolean;
  numberOfVotes: number;
};

export const RemoveVoteButton: FC<RemoveVoteProps> = ({noteId, disabled, numberOfVotes}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const deleteVote = () => {
    dispatch(Actions.deleteVote(noteId));
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
      onClick={deleteVote}
      onAnimationEnd={() => {
        setDoBump(false);
      }}
    >
      <span className="vote-button-remove__folded-corner" />
      <RemoveIcon className="vote-button-remove__icon" />
      <span className="vote-button-remove__count">{numberOfVotes}</span>
    </DotButton>
  );
};
