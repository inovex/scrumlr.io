import {Actions} from "store/action";
import {DotButton} from "components/DotButton";
import "./RemoveVoteButton.scss";
import classNames from "classnames";
import {FC} from "react";
import {useDispatch} from "react-redux";

type RemoveVoteProps = {
  noteId: string;
  activeVoting: boolean;
  votes: number;
  ownVotes: number;
  tabIndex: number;
};

export const RemoveVoteButton: FC<RemoveVoteProps> = ({noteId, activeVoting, votes, ownVotes, tabIndex}) => {
  const dispatch = useDispatch();

  const deleteVote = () => {
    dispatch(Actions.deleteVote(noteId));
  };

  return (
    <DotButton tabIndex={tabIndex} className={classNames("vote-button-remove", {"vote-button-remove--own-vote": ownVotes > 0})} disabled={!activeVoting} onClick={deleteVote}>
      <span className="vote-button-remove__folded-corner" />
      <span>{activeVoting ? ownVotes : votes}</span>
    </DotButton>
  );
};
