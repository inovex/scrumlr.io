import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../types/state';
import { addVote, getVotes, getVotingConfiguration, removeVote } from '../domain/votes';
import Button from '@material-ui/core/Button';
import { BoardContext } from '../routing/pages/Board';
import { getCurrentUser } from '../domain/auth';
import { createSelector } from 'reselect';
import { mapWithId } from '../util/withId';

export interface CardProps {
    id: string;
    text: string;
    author: string;
}

const stateSelector = createSelector(
    (state: ApplicationState) => state.firestore.data.boards,
    (state: ApplicationState) => state.firestore.data.members,
    (state: ApplicationState) => state.firestore.data.users,
    (boards, members, users) => {
        const currentUserUid = getCurrentUser()!.uid;
        const board = Object.values(boards)[0];

        const votingConfiguration = getVotingConfiguration(board);
        const showVotes = votingConfiguration.votingCompleted || Boolean(board.voting?.showVotes);
        const voteLimit = board.voting?.voteLimit || null;
        const allowMultivote = Boolean(board.voting?.allowMultivote);
        const membersWithId = mapWithId(members);
        const allVotes = membersWithId
            .filter((member) => showVotes || member.id === currentUserUid)
            .map((member) => member.votes || [])
            .reduce((previous, next) => previous.concat(next), []);

        return {
            ...votingConfiguration,
            voteLimit,
            allowMultivote,
            allVotes,
            userVotes: members[currentUserUid].votes || [],
            users
        };
    }
);

export const Card: React.FC<CardProps> = ({ id, text, author }) => {
    const { boardId } = useContext(BoardContext);
    const { votingEnabled, votingCompleted, voteLimit, allowMultivote, allVotes, userVotes, users } = useSelector(stateSelector);
    const currentUserUid = getCurrentUser()!.uid;
    const authorProfile = users[author];

    const votes = getVotes(id, allVotes);
    const votedOnCard = userVotes.indexOf(id) >= 0;
    let allowVote = false;
    if ((!voteLimit || userVotes.length < voteLimit) && ((!allowMultivote && !votedOnCard) || allowMultivote)) {
        allowVote = true;
    }

    const onAdd = () => {
        if (allowVote) {
            addVote(boardId, id, currentUserUid);
        }
    };

    const onRemove = () => {
        if (votedOnCard) {
            removeVote(boardId, id, currentUserUid);
        }
    };

    return (
        <div>
            <p>{text}</p>
            <p>{authorProfile.displayName}</p>
            {votingEnabled && (
                <>
                    <p>Votes: {votes}</p>
                    <Button onClick={onRemove} disabled={!votingEnabled || votingCompleted || !votedOnCard}>
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
