import { Members, VotingConfiguration } from '../types/state';
import { getFirebase } from 'react-redux-firebase';

export const startVoting = (boardId: string, voteLimit: number | null, allowMultivote: boolean, showVotes: boolean) => {
    return getFirebase()
        .firestore()
        .collection('boards')
        .doc(boardId!)
        .update({
            voting: {
                completed: false,
                voteLimit,
                allowMultivote,
                showVotes
            }
        });
};

export const completeVoting = (boardId: string) => {
    return getFirebase()
        .firestore()
        .collection('boards')
        .doc(boardId!)
        .update({
            'voting.completed': true
        } as Partial<VotingConfiguration>);
};

export const resetVoting = (boardId: string) => {
    return getFirebase()
        .firestore()
        .collection('boards')
        .doc(boardId!)
        .update({
            voting: null
        })
        .then(() => {
            getFirebase()
                .firestore()
                .collection('boards')
                .doc(boardId)
                .collection('members')
                .get()
                .then((collection) => {
                    collection.forEach((member) => {
                        member.ref.update({ votes: null });
                    });
                });
        });
};

export const getVotes = (cardId: string, members: Members) => {
    return Object.values(members)
        .flatMap((member) => member.votes || [])
        .filter((vote) => vote === cardId).length;
};

export const addVote = (boardId: string, cardId: string, userId: string) => {
    const memberRef = getFirebase().firestore().collection('boards').doc(boardId!).collection('members').doc(userId);
    return getFirebase()
        .firestore()
        .runTransaction((transaction) => {
            return transaction.get(memberRef).then((member) => {
                const votes = member.data()?.votes || [];
                votes.push(cardId);
                transaction.update(memberRef, {
                    votes
                });
            });
        });
};

export const removeVote = (boardId: string, cardId: string, userId: string) => {
    const memberRef = getFirebase().firestore().collection('boards').doc(boardId!).collection('members').doc(userId);
    return getFirebase()
        .firestore()
        .runTransaction((transaction) => {
            return transaction.get(memberRef).then((member) => {
                const votes: string[] = member.data()?.votes || [];
                const cardIndex = votes.indexOf(cardId);
                if (cardIndex >= 0) {
                    transaction.update(memberRef, {
                        votes: votes.filter((value, index) => index !== cardIndex)
                    });
                }
            });
        });
};
