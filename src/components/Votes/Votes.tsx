import store from "store";
import {ActionFactory} from "store/action";
import {DotButton} from "components/DotButton";
// import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import "./Votes.scss";
import classNames from "classnames";
import {VoteClientModel} from "types/vote";
import Parse from "parse";

type VotesProps = {
  className?: string;
  noteId: string;
  votes: VoteClientModel[];
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
      {props.votes.length > 0 && (
        <DotButton
          className={classNames("dot-button__delete", {"dot-button--own-vote": props.votes.findIndex((vote) => vote.user === Parse.User.current()?.id) !== -1})}
          onClick={deleteVote}
        >
          {props.votes.length.toString()}
        </DotButton>
      )}
      {props.activeVoting && (
        <DotButton className="dot-button__add" onClick={addVote}>
          +
        </DotButton>
      )}
    </div>
  );
};
