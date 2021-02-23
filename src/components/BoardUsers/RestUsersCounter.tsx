import React from 'react';
import './BoardUser.scss';

export interface RestUsersCounterProps {
  count: number;
}

const RestUsersCounter = ({ count }: RestUsersCounterProps) => {
  return (
    <li>
      <div className="rest-users">
        <div className="rest-users__count" >{count}</div>
      </div>
    </li>
  );
};

export default RestUsersCounter;