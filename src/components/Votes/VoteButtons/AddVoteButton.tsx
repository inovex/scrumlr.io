import {FC} from "react";
import {useTranslation} from "react-i18next";
import {DotButton} from "components/DotButton";
import {Plus} from "components/Icon";
import "./AddVoteButton.scss";
import {useAppDispatch} from "store";
import {addVote} from "store/features";
import classNames from "classnames";
import {needsHighContrast} from "constants/colors";

type AddVoteProps = {
  noteId: string;
  disabled: boolean;
  disabledReason?: string;
  colorClassName?: string;
};

export const AddVoteButton: FC<AddVoteProps> = ({noteId, disabled, disabledReason, colorClassName}) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  const dispatchAddVote = () => {
    dispatch(addVote(noteId));
  };

  return (
    <DotButton
      className={classNames("vote-button-add", colorClassName && needsHighContrast(colorClassName) && "vote-button-add--high-contrast")}
      onClick={dispatchAddVote}
      disabled={disabled}
      dataTooltipId="scrumlr-tooltip"
      dataTooltipContent={!disabled ? t("Votes.AddVote") : disabledReason}
    >
      <Plus className="vote-button-add__icon" />
    </DotButton>
  );
};
