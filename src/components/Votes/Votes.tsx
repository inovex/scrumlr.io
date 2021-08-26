import store from "store";
import {ActionFactory} from "store/action";
import {DotButton} from "components/DotButton";
// import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import "./Votes.scss";

export type VotesProps = {
  noteId: string;
  numberOfVotes: number;
  activeVoting: boolean;
};

export const Votes = (props: VotesProps) => {
  const addVote = () => {
    store.dispatch(ActionFactory.addVote(props.noteId));
  };

  const deleteVote = () => {
    store.dispatch(ActionFactory.deleteVote(props.noteId));
  };

  return (
    <div className="votes">
      {props.numberOfVotes > 0 && (
        <DotButton className="test" onClick={deleteVote}>
          {props.numberOfVotes.toString()}
        </DotButton>
      )}
      {props.activeVoting && <DotButton onClick={addVote}>+</DotButton>}
    </div>
  );
};
