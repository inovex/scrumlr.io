import {Timer} from "components/Timer";
import {VoteDisplay} from "components/Votes/VoteDisplay";
import ReactDOM from "react-dom";
import "./Infobar.scss";
import {useAppSelector} from "../../store";

export const Infobar = () => {
  const state = useAppSelector((applicationState) => ({
    endTime: applicationState.board.data?.timerUTCEndTime,
    activeVoting: applicationState.board.data?.voting === "active",
    possibleVotes: applicationState.voteConfiguration.voteLimit,
    usedVotes: applicationState.votes.filter((vote) => vote.votingIteration === applicationState.voteConfiguration.votingIteration && vote.user === Parse.User.current()?.id)
      .length,
  }));

  return ReactDOM.createPortal(
    <aside className="infobar">
      {state.endTime && <Timer endTime={state.endTime} />}
      {state.activeVoting && <VoteDisplay usedVotes={state.usedVotes} possibleVotes={state.possibleVotes} />}
    </aside>,
    document.getElementById("root")!
  );
};
