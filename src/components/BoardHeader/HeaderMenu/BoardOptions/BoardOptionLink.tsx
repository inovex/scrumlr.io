import {MouseEventHandler, VFC} from "react";
import {Link} from "react-router";
import classNames from "classnames";
import "./BoardOptionLink.scss";

export type BoardOptionLinkProps = {
  to: string;
  label: string;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
};

export const BoardOptionLink: VFC<BoardOptionLinkProps> = (props) => (
  <Link to={props.to} onClick={props.onClick} className={classNames("board-option-link")}>
    <p className="board-option-link__label">{props.label}</p>
  </Link>
);
