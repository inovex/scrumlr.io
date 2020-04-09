import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../types/state';
import { addVote, getVotes, removeVote } from '../domain/votes';
import Button from '@material-ui/core/Button';
import { BoardContext } from '../routing/pages/Board';
import { getCurrentUser } from '../domain/auth';

export interface CardProps {
    id: string;
    text: string;
    author: string;
}

export const Card: React.FC<CardProps> = ({ id, text, author }) => {
    const { boardId } = useContext(BoardContext);
    const { users, members } = useSelector((state: ApplicationState) => state.firestore.data);
    const user = users[author];
    const votes = getVotes(id, members);

    return (
        <div>
            <p>{text}</p>
            <p>{user.displayName}</p>
            <p>Votes: {votes}</p>
            <Button onClick={() => removeVote(boardId!, id, getCurrentUser()!.uid)}>Remove Vote</Button>
            <Button onClick={() => addVote(boardId!, id, getCurrentUser()!.uid)}>Add Vote</Button>
        </div>
    );
};

export default Card;
