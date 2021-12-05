import "./BoardUser.scss";
import classNames from "classnames";
import {ReactComponent as IconCheck} from "assets/icon-check.svg";
import {Avatar} from "../Avatar";
import {Badge} from "../Badge";

export interface UserAvatarProps {
  className?: string;
  avatarClassName?: string;
  id: string;
  name: string;
  avatar?: string;
  ready?: boolean;
  badgeText?: string;
}

export const UserAvatar = ({name, badgeText, id, ready, avatar, className, avatarClassName}: UserAvatarProps) => (
  <div className={classNames("user-avatar", className)} title={name}>
    {avatar ? <img src={avatar} className={avatarClassName} alt={name} /> : <Avatar seed={id} className={avatarClassName} />}
    {ready && <IconCheck className="user-avatar__ready" />}
    {badgeText && <Badge text={badgeText} />}
  </div>
);
