import React from 'react';
import './BoardUser.scss';

export interface RestUsersCounterProps {
    count: number;
}

const RestUsersCounter = ({count}: RestUsersCounterProps) => {
    return (
        <li>
            <div className="user"> 
                <div className="user__initials" >+{count}</div>
            </div>
        </li>
    );
};

export default RestUsersCounter;