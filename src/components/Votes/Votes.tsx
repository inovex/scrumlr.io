import store from "store";
import {ActionFactory} from "store/action";
import {AddVote} from "components/Votes/AddVote";
import {DeleteVote} from "components/Votes/DeleteVote";

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
      {props.numberOfVotes > 0 && <DeleteVote deleteVote={deleteVote} numberOfVotes={props.numberOfVotes} />}
      {props.activeVoting && <AddVote addVote={addVote} />}
    </div>
  );
};
