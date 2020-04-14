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
    const { boards, members, users } = useSelector((state: ApplicationState) => state.firestore.data);
    const currentUserUid = getCurrentUser()!.uid;
    const authorProfile = users[author];

    const votingEnabled = Boolean(boards[boardId!].voting);
    const votingCompleted = votingEnabled ? boards[boardId!].voting!.completed : false;
    let votes = 0;
    if (votingEnabled && (votingCompleted || boards[boardId!].voting!.showVotes)) {
        votes = getVotes(id, members);
    } else if (votingEnabled) {
        votes = getVotes(id, { [currentUserUid]: members[currentUserUid] });
    }

    let allowVote = false;
    let allowMultivote = false;
    let voteLimit: number | null = null;
    if (boards[boardId!].voting) {
        voteLimit = boards[boardId!].voting!.voteLimit;
        allowMultivote = boards[boardId!].voting!.allowMultivote;
    }

    const spendVotesOverall = members[currentUserUid].votes?.length || 0;
    const spendVotesOnCard = (members[currentUserUid].votes || []).indexOf(id) >= 0;
    if ((!voteLimit || spendVotesOverall < voteLimit) && ((!allowMultivote && !spendVotesOnCard) || allowMultivote)) {
        allowVote = true;
    }
    const onAdd = () => {
        if (allowVote) {
            addVote(boardId!, id, getCurrentUser()!.uid);
        }
    };

    const onRemove = () => {
        if (spendVotesOnCard) {
            removeVote(boardId!, id, getCurrentUser()!.uid);
        }
    };

    return (
        <div>
            <p>{text}</p>
            <p>{authorProfile.displayName}</p>
            {votingEnabled && (
                <>
                    <p>Votes: {votes}</p>
                    <Button onClick={onRemove} disabled={!votingEnabled || votingCompleted || !spendVotesOnCard}>
                        Remove Vote
                    </Button>
                    <Button onClick={onAdd} disabled={!votingEnabled || votingCompleted || !allowVote}>
                        Add Vote
                    </Button>
                </>
            )}
        </div>
    );
};

export default Card;
