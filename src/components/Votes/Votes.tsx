import store from "store";
import {ActionFactory} from "store/action";
import {AddVote} from "components/Votes/AddVote";
import {DeleteVote} from "components/Votes/DeleteVote";

export type VotesProps = {
  noteId: string;
  numberOfVotes: number;
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
      <AddVote addVote={addVote} />
      <DeleteVote deleteVote={deleteVote} numberOfVotes={props.numberOfVotes} />
    </div>
  );
};
