import "./BoardUser.scss";
import {getInitials} from "constants/name";

export interface UserAvatarProps {
  group: string;
  id: string;
  name: string;
  avatar?: string;
}

export const UserAvatar = ({name, avatar, group}: UserAvatarProps) => (
  <div className={`${group}-avatar`}>
    {avatar ? (
      <img src={avatar} alt={name} />
    ) : (
      <div className="user__initials" title={name}>
        {getInitials(name)}
      </div>
    )}
  </div>
);
