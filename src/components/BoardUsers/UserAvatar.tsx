import "./BoardUser.scss";
import {getInitials} from "constants/name";

export interface UserAvatarProps {
  id: string;
  name: string;
  avatar?: string;
}

export const UserAvatar = ({name, avatar}: UserAvatarProps) => (
  <li className="user-avatar">
    {avatar ? (
      <img src={avatar} alt={name} />
    ) : (
      <div className="user__initials" title={name}>
        {getInitials(name)}
      </div>
    )}
  </li>
);
