import store from "store";
import {ActionFactory} from "store/action";
import {DotButton} from "components/DotButton";
import "./AddVoteButton.scss";
import "./VoteButton.scss";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {FC} from "react";

type AddVoteProps = {
  noteId: string;
  tabIndex: number;
};

export const AddVoteButton: FC<AddVoteProps> = ({noteId, tabIndex}) => {
  const addVote = () => {
    store.dispatch(ActionFactory.addVote(noteId));
  };

  return (
    <DotButton tabIndex={tabIndex} className="vote-button-add" onClick={addVote}>
      <PlusIcon className="vote-button-add__icon" />
    </DotButton>
  );
};
