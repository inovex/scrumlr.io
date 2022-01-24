import {VFC} from "react";
import {Link} from "react-router-dom";
import classNames from "classnames";
import "./BoardOptionLink.scss";

export type BoardOptionLinkProps = {
  to: string;
  label: string;
};

export const BoardOptionLink: VFC<BoardOptionLinkProps> = (props) => (
  <Link to={props.to} className={classNames("board-option-link")}>
    <p className="board-option-link__label">{props.label}</p>
  </Link>
);
