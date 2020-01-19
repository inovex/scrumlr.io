import * as firebase from 'firebase';
import { initFirestorter } from 'firestorter';
import SessionStore from './sessionStore';
import DataStore from './dataStore';

firebase.initializeApp({
    apiKey: 'AIzaSyAJj_W-oo-G9k4EU4SImBICuQlMWjRwxOA',
    authDomain: 'playground-73a29.firebaseapp.com',
    databaseURL: 'https://playground-73a29.firebaseio.com',
    projectId: 'playground-73a29'
});

initFirestorter({ firebase });

export class RootStore {
    public sessionStore: SessionStore;
    public dataStore: DataStore;

    constructor() {
        this.sessionStore = new SessionStore(this);
        this.dataStore = new DataStore(this);
    }
}

const rootStore = new RootStore();
export default rootStore;
