import {FC} from "react";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {Actions} from "store/action";
import {DotButton} from "components/DotButton";
import {Plus} from "components/Icon";
import "./AddVoteButton.scss";

type AddVoteProps = {
  noteId: string;
  disabled: boolean;
};

export const AddVoteButton: FC<AddVoteProps> = ({noteId, disabled}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const addVote = () => {
    dispatch(Actions.addVote(noteId));
  };

  return (
    <DotButton title={t("Votes.AddVote")} className="vote-button-add" onClick={addVote} disabled={disabled}>
      <Plus className="vote-button-add__icon" />
    </DotButton>
  );
};
