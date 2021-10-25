import "./BoardUser.scss";
import {getInitials} from "constants/name";
import classNames from "classnames";
import {ReactComponent as IconCheck} from "assets/icon-check.svg";

export interface UserAvatarProps {
  className?: string;
  id: string;
  name: string;
  avatar?: string;
  ready?: boolean;
}

export const UserAvatar = ({name, avatar, className, ready}: UserAvatarProps) => (
  <div className={classNames("user-avatar", className)}>
    {avatar ? (
      <img src={avatar} alt={name} />
    ) : (
      <div className="user__initials" title={name}>
        {getInitials(name)}
        {ready && <IconCheck className="user-avatar__ready" />}
      </div>
    )}
  </div>
);
