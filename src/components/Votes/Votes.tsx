import store from "store";
import {ActionFactory} from "store/action";
import {DotButton} from "components/DotButton";
// import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import "./Votes.scss";
import classNames from "classnames";
import {VoteClientModel} from "types/vote";
import Parse from "parse";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {VoteConfigurationClientModel} from "types/voteConfiguration";

type VotesProps = {
  className?: string;
  noteId: string;
  votes: VoteClientModel[];
  voteConfiguration: VoteConfigurationClientModel;
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
          disabled={!props.activeVoting}
          onClick={deleteVote}
        >
          <span className="dot-button__folded-corner" />
          <span>{props.votes.length.toString()}</span>
        </DotButton>
      )}
      {props.activeVoting && (props.voteConfiguration.allowMultipleVotesPerNote || (!props.voteConfiguration.allowMultipleVotesPerNote && props.votes.length < 1)) && (
        <DotButton className="dot-button__add" onClick={addVote}>
          <PlusIcon className="dot-button__add-icon" />
        </DotButton>
      )}
    </div>
  );
};
