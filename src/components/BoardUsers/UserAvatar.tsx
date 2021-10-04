import "./BoardUser.scss";
import {getInitials} from "constants/Name";

export interface UserAvatarProps {
  group: string;
  id: string;
  name: string;
  avatar?: string;
}

const UserAvatar = ({name, avatar, group}: UserAvatarProps) => (
  <li className={`${group}-avatar`}>
    {avatar ? (
      <img src={avatar} alt={name} />
    ) : (
      <div className="user__initials" title={name}>
        {getInitials(name)}
      </div>
    )}
  </li>
);

export default UserAvatar;
