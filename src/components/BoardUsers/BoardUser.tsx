import React from 'react';
import './BoardUser.scss';

export interface BoardUserProps {
  id: string;
  name: string;
  avatar?: string;
}

const BoardUser = ({ name, avatar }: BoardUserProps) => {
  const getUserInitials = (name: string): string => {
    return name.split(' ')
      .map(n => n[0])
      .join('');
  }

  return (
    <li>
      <div className="user">
        {!!avatar
          ? <img className="user__avatar" src={avatar} alt={name} />
          : <div className="user__initials" title={name}>{getUserInitials(name)}</div>
        }
      </div>
    </li>
  );
};

export default BoardUser;