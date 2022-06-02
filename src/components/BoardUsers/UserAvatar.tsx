import "./BoardUser.scss";
import classNames from "classnames";
import {ReactComponent as IconCheck} from "assets/icon-check.svg";
import {ReactComponent as RaisedHand} from "assets/icon-hand.svg";
import {Avatar} from "../Avatar";
import {Badge} from "../Badge";

export interface UserAvatarProps {
  className?: string;
  avatarClassName?: string;
  id: string;
  name: string;
  avatar?: string;
  ready?: boolean;
  raisedHand?: boolean;
  badgeText?: string;
}

export const UserAvatar = ({name, badgeText, id, ready, raisedHand, avatar, className, avatarClassName}: UserAvatarProps) => (
  <div className={classNames("user-avatar", className, ready && "user-ready")} title={name}>
    {ready && !raisedHand && <IconCheck className="user-avatar__ready" />}
    {raisedHand && <RaisedHand className="user-avatar__raised-hand" />}
    {avatar ? <img src={avatar} className={avatarClassName} alt={name} /> : <Avatar seed={id} className={avatarClassName} />}
    {badgeText && <Badge text={badgeText} />}
  </div>
);
