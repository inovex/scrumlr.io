import './BoardUser.scss';
import { getInitials } from 'constants/Name'
export interface UserAvatarProps {
  id: string;
  name: string;
  avatar?: string;
}

const UserAvatar = ({ name, avatar }: UserAvatarProps) => {

  return (
    <li className="user-avatar">
      {!!avatar
        ? <img src={avatar} alt={name} />
        : <div className="user__initials" title={name}>{getInitials(name)}</div>
      }
    </li>
  );
};

export default UserAvatar;