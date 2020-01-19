import { initFirestorter } from 'firestorter';
import SessionStore from './auth/sessionStore';
import DataStore from './board/dataStore';
import { firebase } from './firebase';

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
