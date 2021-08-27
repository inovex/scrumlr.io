import store from "store";
import {ActionFactory} from "store/action";
import {DotButton} from "components/DotButton";
// import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import "./Votes.scss";
import classNames from "classnames";

type VotesProps = {
  className?: string;
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
    <div className={classNames("votes", props.className)}>
      {props.numberOfVotes > 0 && <DotButton onClick={deleteVote}>{props.numberOfVotes.toString()}</DotButton>}
      {props.activeVoting && <DotButton onClick={addVote}>+</DotButton>}
    </div>
  );
};
