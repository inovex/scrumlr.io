import {Timer} from "components/Timer";
import {VoteDisplay} from "components/Votes/VoteDisplay";
import ReactDOM from "react-dom";
import "./Infobar.scss";
import _ from "underscore";
import {useAppSelector} from "store";
import Parse from "parse";

export const InfoBar = () => {
  const state = useAppSelector(
    (applicationState) => ({
      endTime: applicationState.board.data?.timerUTCEndTime,
      activeVoting: applicationState.board.data?.voting === "active",
      possibleVotes: applicationState.voteConfiguration.voteLimit,
      usedVotes: applicationState.votes.filter((vote) => vote.votingIteration === applicationState.voteConfiguration.votingIteration && vote.user === Parse.User.current()?.id)
        .length,
    }),
    _.isEqual
  );

  return ReactDOM.createPortal(
    <aside className="info-bar">
      {state.endTime && <Timer endTime={state.endTime} />}
      {state.activeVoting && <VoteDisplay usedVotes={state.usedVotes} possibleVotes={state.possibleVotes} />}
    </aside>,
    document.getElementById("root")!
  );
};
