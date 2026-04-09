import {FC} from "react";
import {useTranslation} from "react-i18next";
import {DotButton} from "components/DotButton";
import {PlusIcon} from "components/Icon";
import {useAppDispatch} from "store";
import {addVote} from "store/features";
import classNames from "classnames";
import {needsHighContrast} from "constants/colors";
import {Tooltip} from "components/Tooltip";
import "./AddVoteButton.scss";

type AddVoteProps = {noteId: string; disabled: boolean; disabledReason?: string; colorClassName?: string};

export const AddVoteButton: FC<AddVoteProps> = ({noteId, disabled, disabledReason, colorClassName}) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  const dispatchAddVote = () => {
    dispatch(addVote(noteId));
  };

  return (
    <>
      <DotButton
        id={`vote-button-add-${noteId}`}
        className={classNames("vote-button-add", {"vote-button-add--high-contrast": needsHighContrast(colorClassName)})}
        onClick={dispatchAddVote}
        disabled={disabled}
      >
        <PlusIcon className="vote-button-add__icon" />
      </DotButton>
      <Tooltip anchorId={`vote-button-add-${noteId}`}>{!disabled ? t("Votes.AddVote") : disabledReason}</Tooltip>
    </>
  );
};
