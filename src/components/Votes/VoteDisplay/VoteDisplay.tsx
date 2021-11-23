import classNames from "classnames";
import "./VoteDisplay.scss";

type VoteDisplayProps = {
  usedVotes: number;
  possibleVotes: number;
};

export var VoteDisplay = function(props: VoteDisplayProps) {
  return <div id="voteDisplay" className={classNames("voteDisplay")}>
    <span>
      {props.usedVotes} / {props.possibleVotes}
    </span>
  </div>
}
