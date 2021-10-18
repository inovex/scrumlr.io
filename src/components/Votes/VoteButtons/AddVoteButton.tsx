import store from "store";
import {ActionFactory} from "store/action";
import {DotButton} from "components/DotButton";
import "./AddVoteButton.scss";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {FC} from "react";

type AddVoteProps = {
  noteId: string;
};

export const AddVoteButton: FC<AddVoteProps> = ({noteId}: AddVoteProps) => {
  const addVote = () => {
    store.dispatch(ActionFactory.addVote(noteId));
  };

  return (
    <DotButton className="vote-button-add" onClick={addVote}>
      <PlusIcon className="vote-button-add__icon" />
    </DotButton>
  );
};
