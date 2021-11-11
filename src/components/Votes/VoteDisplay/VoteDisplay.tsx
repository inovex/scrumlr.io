import classNames from "classnames";
import "./VoteDisplay.scss";

type VoteDisplayProps = {
  usedVotes: number;
  possibleVotes: number;
};

export const VoteDisplay = (props: VoteDisplayProps) => (
    <div id="voteDisplay" className={classNames("voteDisplay")}>
      <span>
        {props.possibleVotes} / {props.usedVotes}
      </span>
    </div>
  );
