import {VFC, useState} from "react";
import {useNavigate} from "react-router";
import {Portal} from "components/Portal";
import {Toggle} from "components/Toggle";
import store, {useAppSelector} from "store";
import {Link} from "react-router-dom";
import {ActionFactory} from "store/action";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./VotingDialog.scss";

export const VotingDialog: VFC = () => {
  const navigate = useNavigate();
  const boardId = useAppSelector((state) => state.board.data!.id);
  const activeVoting = useAppSelector((state) => state.board.data!.voting === "active");
  const [allowCumulativeVoting, setAllowCumulativeVoting] = useState(false);
  const [anonymousVoting, setAnonymousVoting] = useState(false);
  const [numberOfVotes, setNumberOfVotes] = useState(5);

  const startVoting = () => {
    store.dispatch(
      ActionFactory.addVoteConfiguration({
        boardId,
        voteLimit: numberOfVotes,
        showVotesOfOtherUsers: !anonymousVoting,
        allowMultipleVotesPerNote: allowCumulativeVoting,
      })
    );
    store.dispatch(ActionFactory.editBoard({id: boardId, voting: "active"}));
    navigate(`/board/${boardId}`);
  };
  const stopVoting = () => {
    store.dispatch(ActionFactory.editBoard({id: boardId, voting: "disabled"}));
    navigate(`/board/${boardId}`);
  };
  const cancelVoting = () => {
    store.dispatch(ActionFactory.cancelVoting(boardId));
    navigate(`/board/${boardId}`);
  };

  return (
    <Portal darkBackground onClose={() => navigate(`/board/${boardId}`)}>
      <aside className="voting-dialog">
        {!activeVoting ? (
          <article className="voting-dialog__content">
            <h2 className="voting-dialog__header-text">Voting</h2>
            <button className="voting-dialog__button" onClick={() => setAllowCumulativeVoting((state) => !state)}>
              <label>Allow cumulative voting</label>
              <Toggle active={allowCumulativeVoting} className="voting-dialog__toggle" />
            </button>
            <button className="voting-dialog__button" onClick={() => setAnonymousVoting((state) => !state)}>
              <label>Anonymous voting</label>
              <Toggle active={anonymousVoting} className="voting-dialog__toggle" />
            </button>
            <div className="voting-dialog__button">
              <label>Number of votes</label>
              <button onClick={() => setNumberOfVotes((prev) => Math.min(++prev, 99))} className="voting-dialog__vote-button">
                +
              </button>
              <label className="voting-dialog__vote-label">{numberOfVotes}</label>
              <button onClick={() => setNumberOfVotes((prev) => Math.max(--prev, 0))} className="voting-dialog__vote-button">
                -
              </button>
            </div>
            <button className="voting-dialog__start-button" onClick={() => startVoting()}>
              <label>Start voting phase</label>
            </button>
          </article>
        ) : (
          <article className="voting-dialog__content">
            <h2 className="voting-dialog__header-text">Voting</h2>
            <button className="voting-dialog__start-button" onClick={() => cancelVoting()}>
              <label>Cancel voting phase</label>
            </button>
            <button className="voting-dialog__start-button" onClick={() => stopVoting()}>
              <label>End voting phase</label>
            </button>
          </article>
        )}
        <Link to={`/board/${boardId}`} className="voting-dialog__close-button">
          <CloseIcon className="close-button__icon" />
        </Link>
      </aside>
    </Portal>
  );
};
