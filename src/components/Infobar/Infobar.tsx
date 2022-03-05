import {Timer} from "components/Timer";
import {VoteDisplay} from "components/Votes/VoteDisplay";
import ReactDOM from "react-dom";
import "./Infobar.scss";
import _ from "underscore";
import {useAppSelector} from "store";

export const InfoBar = () => {
  const state = useAppSelector(
    (applicationState) => ({
      endTime: applicationState.board.data?.timerEnd, // FIXME convert to date
      activeVoting: applicationState.board.data?.showVoting,
      possibleVotes: applicationState.votings.open?.voteLimit,
      usedVotes: applicationState.votes.length,
    }),
    _.isEqual
  );

  return ReactDOM.createPortal(
    <aside className="info-bar">
      {state.endTime && <Timer endTime={new Date(state.endTime)} />}
      {state.activeVoting && <VoteDisplay usedVotes={state.usedVotes} possibleVotes={state.possibleVotes!} />}
    </aside>,
    document.getElementById("root")!
  );
};
