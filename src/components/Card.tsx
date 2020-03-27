import React from 'react';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../types/state';

export interface CardProps {
    id: string;
    text: string;
    author: string;
}

export const Card: React.FC<CardProps> = ({ text, author }) => {
    const users = useSelector((state: ApplicationState) => state.firestore.data.users);
    const user = users[author];

    return (
        <div>
            <p>{text}</p>
            <p>{user.displayName}</p>
        </div>
    );
};

export default Card;
