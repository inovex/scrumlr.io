import {useAppSelector} from "store";
import {Actions} from "store/action";
import {DotButton} from "components/DotButton";
import "./AddVoteButton.scss";
import "./VoteButton.scss";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {FC} from "react";
import {ApplicationState} from "types";
import {useDispatch} from "react-redux";

type AddVoteProps = {
  noteId: string;
  tabIndex: number;
  disabled: boolean;
};

export const AddVoteButton: FC<AddVoteProps> = ({noteId, tabIndex, disabled}) => {
  const dispatch = useDispatch();
  const state = useAppSelector((applicationState: ApplicationState) => ({
    votingEnabled: !!applicationState.votings.open,
  }));

  const addVote = () => {
    if (state.votingEnabled) {
      dispatch(Actions.addVote(noteId));
    }
  };

  return (
    <DotButton tabIndex={tabIndex} className="vote-button-add" onClick={addVote} disabled={disabled}>
      <PlusIcon className="vote-button-add__icon" />
    </DotButton>
  );
};
