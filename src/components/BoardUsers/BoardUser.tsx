import React from 'react';
import './BoardUser.scss';
import {getInitials} from 'constants/Name'
export interface BoardUserProps {
  id: string;
  name: string;
  avatar?: string;
}

const BoardUser = ({ name, avatar }: BoardUserProps) => {

  return (
    <li>
      <div className="user">
        {!!avatar
          ? <img className="user__avatar" src={avatar} alt={name} />
          : <div className="user__initials" title={name}>{getInitials(name)}</div>
        }
      </div>
    </li>
  );
};

export default BoardUser;