import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import {DotButton} from "components/DotButton";
import "./AddVoteButton.scss";
import "./VoteButton.scss";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {FC} from "react";
import {ApplicationState} from "types/store";

type AddVoteProps = {
  noteId: string;
  tabIndex: number;
  disabled: boolean;
};

export const AddVoteButton: FC<AddVoteProps> = ({noteId, tabIndex, disabled}) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    id: applicationState.board.data!.id,
    votingIteration: applicationState.voteConfiguration.votingIteration,
  }));

  const addVote = () => {
    store.dispatch(ActionFactory.addVote(noteId, state.id, state.votingIteration));
  };

  return (
    <DotButton tabIndex={tabIndex} className="vote-button-add" onClick={addVote} disabled={disabled}>
      <PlusIcon className="vote-button-add__icon" />
    </DotButton>
  );
};
