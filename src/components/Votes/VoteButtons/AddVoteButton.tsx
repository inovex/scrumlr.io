import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {DotButton} from "components/DotButton";
import "./AddVoteButton.scss";
import "./VoteButton.scss";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {FC} from "react";
import {ApplicationState} from "types";

type AddVoteProps = {
  noteId: string;
  tabIndex: number;
  disabled: boolean;
};

export const AddVoteButton: FC<AddVoteProps> = ({noteId, tabIndex, disabled}) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    votingEnabled: Boolean(applicationState.votings.open),
  }));

  const addVote = () => {
    if (state.votingEnabled) {
      store.dispatch(Actions.addVote(noteId));
    }
  };

  return (
    <DotButton tabIndex={tabIndex} className="vote-button-add" onClick={addVote} disabled={disabled}>
      <PlusIcon className="vote-button-add__icon" />
    </DotButton>
  );
};
