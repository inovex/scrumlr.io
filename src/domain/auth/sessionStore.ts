import { observable, action, when } from 'mobx';
import { RootStore } from '../rootStore';
import { User } from 'firebase';
import { Document } from 'firestorter';

class SessionStore {
    public rootStore: RootStore;

    @observable
    public authUser: User | null = null;

    @observable
    public userProfile: Document | null = null;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        when(() => !!this.authUser, this.saveOrUpdateUserProfile);
    }

    @action setAuthUser = (authUser: User | null): void => {
        this.authUser = authUser;
        if (!!authUser) {
            this.userProfile = new Document(`users/${authUser.uid}`);
        } else {
            this.userProfile = null;
        }
    };

    saveOrUpdateUserProfile = () => {
        this.userProfile?.set(
            {
                displayName: this.authUser?.displayName,
                photoURL: this.authUser?.photoURL,
                ...this.userProfile.data
            },
            { merge: true }
        );
    };
}

export default SessionStore;
