import firebase from "firebaseSetup";

export default interface BoardData {
    owner: string;
    topic: string;
    date: firebase.firestore.Timestamp;
    config: {
        private: boolean;
        encryption: boolean;
        maxVotes: number;
        multiVote: boolean;
        hideVotes: boolean;
        columnConfig?: {};
    };
};