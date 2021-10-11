import "./BoardUser.scss";
import {getInitials} from "constants/name";
import classNames from "classnames";

export interface UserAvatarProps {
  className?: string;
  id: string;
  name: string;
  avatar?: string;
}

export const UserAvatar = ({name, avatar, className}: UserAvatarProps) => (
  <div className={classNames("user-avatar", className)}>
    {avatar ? (
      <img src={avatar} alt={name} />
    ) : (
      <div className="user__initials" title={name}>
        {getInitials(name)}
      </div>
    )}
  </div>
);
