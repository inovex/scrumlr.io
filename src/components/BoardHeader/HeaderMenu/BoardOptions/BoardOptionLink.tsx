import {VFC} from "react";
import {Link} from "react-router-dom";
import classNames from "classnames";
import "./BoardOptionLink.scss";

export type BoardOptionLinkProps = {
  to: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (...args: any) => any;
};

export const BoardOptionLink: VFC<BoardOptionLinkProps> = (props) => (
  <Link to={props.to} onClick={props.onClick} className={classNames("board-option-link")}>
    <p className="board-option-link__label">{props.label}</p>
  </Link>
);
