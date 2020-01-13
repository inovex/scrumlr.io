import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {Collection, Document, initFirestorter} from "firestorter";

firebase.initializeApp({
    apiKey: 'AIzaSyAJj_W-oo-G9k4EU4SImBICuQlMWjRwxOA',
    databaseURL: 'https://playground-73a29.firebaseio.com',
    projectId: 'playground-73a29'
});

initFirestorter({ firebase });

export const store: { strings: Collection<Document<{ test: string }>> } = {
    strings: new Collection('strings')
};