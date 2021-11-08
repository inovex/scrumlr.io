import store from "store";
import {ActionFactory} from "store/action";
import {DotButton} from "components/DotButton";
import "./RemoveVoteButton.scss";
import classNames from "classnames";
import {VoteClientModel} from "types/vote";
import {FC} from "react";

type RemoveVoteProps = {
  noteId: string;
  activeVoting: boolean;
  votes: VoteClientModel[];
  ownVotes: VoteClientModel[];
  tabIndex: number;
};

export const RemoveVoteButton: FC<RemoveVoteProps> = ({noteId, activeVoting, votes, ownVotes, tabIndex}) => {
  const deleteVote = () => {
    store.dispatch(ActionFactory.deleteVote(noteId));
  };

  return (
    <DotButton
      tabIndex={tabIndex}
      className={classNames("vote-button-remove", {"vote-button-remove--own-vote": ownVotes.length > 0})}
      disabled={!activeVoting}
      onClick={deleteVote}
    >
      <span className="vote-button-remove__folded-corner" />
      <span>{votes.length.toString()}</span>
    </DotButton>
  );
};
