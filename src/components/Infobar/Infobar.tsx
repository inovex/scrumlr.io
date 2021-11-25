import {Timer} from "components/Timer";
import {VoteDisplay} from "components/Votes/VoteDisplay";
import ReactDOM from "react-dom";
import "./Infobar.scss";

type InfobarProps = {
  endTime?: Date;
  activeVoting: boolean;
  usedVotes: number;
  possibleVotes: number;
};

export const Infobar = (props: InfobarProps) =>
  ReactDOM.createPortal(
    <aside className="infobar">
      {props.endTime && <Timer endTime={props.endTime} />}
      {props.activeVoting && <VoteDisplay usedVotes={props.usedVotes} possibleVotes={props.possibleVotes} />}
    </aside>,
    document.getElementById("root")!
  );
