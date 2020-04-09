import {Members} from "../types/state";
import {getFirebase} from "react-redux-firebase";
import firebase from "firebase";

export const getVotes = (cardId: string, members: Members) => {
    return Object.values(members).map(member => member.votes?.[cardId] || 0).reduce((a, b) => a + b, 0);
};

export const addVote = (boardId: string, cardId: string, userId: string) => {
    return getFirebase().firestore().collection('boards').doc(boardId!).collection('members').doc(userId).update({
        [`votes.${cardId}`]: firebase.firestore.FieldValue.increment(1)
    })
};

export const removeVote = (boardId: string, cardId: string, userId: string) => {
    const memberRef = getFirebase().firestore().collection('boards').doc(boardId!).collection('members').doc(userId);
    return getFirebase().firestore().runTransaction(transaction => {
        return transaction.get(memberRef).then(member => {
            if (!member.exists) {
                throw 'member does not exist';
            }

            const currentVotes = member.data()?.votes?.[cardId] || 0;
            transaction.update(memberRef, {
                [`votes.${cardId}`]: currentVotes - 1 > 0 ? currentVotes - 1 : 0
            })
        })
    });
};