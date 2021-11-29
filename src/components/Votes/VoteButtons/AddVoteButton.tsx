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
  disabled: boolean;
};

export var AddVoteButton: FC<AddVoteProps> = function({noteId, tabIndex, disabled}) {
  const addVote = () => {
    store.dispatch(ActionFactory.addVote(noteId));
  };

  return (
    <DotButton tabIndex={tabIndex} className="vote-button-add" onClick={addVote} disabled={disabled}>
      <PlusIcon className="vote-button-add__icon" />
    </DotButton>
  );
}
