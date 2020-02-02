import { observable, action, when } from 'mobx';
import { RootStore } from '../rootStore';
import { User } from 'firebase';
import { Document } from 'firestorter';
import defaultTo from 'lodash/defaultTo';

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

    private saveOrUpdateUserProfile = () => {
        const displayName = defaultTo(this.authUser?.displayName, defaultTo(this.userProfile?.data.displayName, null));
        const photoURL = defaultTo(this.authUser?.photoURL, defaultTo(this.userProfile?.data.photoURL, null));

        this.userProfile?.set(
            {
                displayName,
                photoURL
            },
            { merge: true }
        );
    };
}

export default SessionStore;
