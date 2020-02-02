import { observable, action, when } from 'mobx';
import { RootStore } from '../rootStore';
import { User } from 'firebase';
import { Document } from 'firestorter';

export interface UserProfile {
    displayName: string | null | undefined;
    photoURL: string | null | undefined;
}

class SessionStore {
    public rootStore: RootStore;

    @observable
    public authUser: User | null = null;

    @observable
    public userProfile: Document<UserProfile> | null = null;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        when(() => !!this.authUser, this.saveOrUpdateUserProfile);
    }

    @action setAuthUser = (authUser: User | null): void => {
        this.authUser = authUser;
        this.userProfile = !authUser ? null : new Document(`users/${authUser.uid}`);
    };

    saveOrUpdateUserProfile = () => {
        this.userProfile?.set(
            {
                displayName: !this.authUser?.displayName ? this.userProfile.data.displayName : this.authUser?.displayName,
                photoURL: !this.authUser?.photoURL ? this.userProfile.data.photoURL : this.authUser?.photoURL
            },
            { merge: true }
        );
    };
}

export default SessionStore;
