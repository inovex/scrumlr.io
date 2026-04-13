import {FC, useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {DotButton} from "components/DotButton";
import {MinusIcon} from "components/Icon";
import "./RemoveVoteButton.scss";
import {useAppDispatch} from "store";
import {deleteVote} from "store/features";
import {needsHighContrast} from "constants/colors";
import {Tooltip} from "components/Tooltip";
// import {t} from "i18next";

type RemoveVoteProps = {
  noteId: string;
  disabled?: boolean;
  numberOfVotes: number;
  colorClassName?: string;
  participantNames?: string;
  isAnonymous?: boolean;
};

export const RemoveVoteButton: FC<RemoveVoteProps> = ({noteId, disabled, numberOfVotes, colorClassName, participantNames, isAnonymous}) => {
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

  const voteDisplayText = isAnonymous ? t("Votes.VotesOnNote", {count: numberOfVotes}) : participantNames;

  return (
    <>
      <DotButton
        id={`vote-button-remove-${noteId}`}
        className={classNames("vote-button-remove", {bump: doBump}, colorClassName && needsHighContrast(colorClassName) && "vote-button-remove--high-contrast")}
        disabled={disabled}
        onClick={dispatchDeleteVote}
        onAnimationEnd={() => {
          setDoBump(false);
        }}
        label={voteDisplayText}
      >
        <span className="vote-button-remove__folded-corner" />
        <MinusIcon className="vote-button-remove__icon" />
        <span className="vote-button-remove__count">{numberOfVotes}</span>
      </DotButton>
      <Tooltip anchorId={`vote-button-remove-${noteId}`}>{voteDisplayText}</Tooltip>
    </>
  );
};
