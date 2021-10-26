import "./BoardUser.scss";
import classNames from "classnames";
import {Avatar} from "../Avatar";

export interface UserAvatarProps {
  className?: string;
  avatarClassName?: string;
  id: string;
  name: string;
  avatar?: string;
}

export const UserAvatar = ({name, id, avatar, className, avatarClassName}: UserAvatarProps) => (
  <div className={classNames("user-avatar", className)} title={name}>
    {avatar ? <img src={avatar} className={avatarClassName} alt={name} /> : <Avatar seed={id} className={avatarClassName} />}
  </div>
);
