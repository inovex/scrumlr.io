import {Actions} from "store/action";
import {DotButton} from "components/DotButton";
import "./AddVoteButton.scss";
import "./VoteButton.scss";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {FC} from "react";
import {useDispatch} from "react-redux";

type AddVoteProps = {
  noteId: string;
  tabIndex: number;
  disabled: boolean;
};

export const AddVoteButton: FC<AddVoteProps> = ({noteId, tabIndex, disabled}) => {
  const dispatch = useDispatch();

  const addVote = () => {
    dispatch(Actions.addVote(noteId));
  };

  return (
    <DotButton tabIndex={tabIndex} className="vote-button-add" onClick={addVote} disabled={disabled}>
      <PlusIcon className="vote-button-add__icon" />
    </DotButton>
  );
};
