import { observable, action } from 'mobx';
import { RootStore } from './index';
import { User } from 'firebase';

class SessionStore {
    public rootStore: RootStore;

    @observable
    public authUser: User | null = null;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action setAuthUser = (authUser: User | null): void => {
        this.authUser = authUser;
    };
}

export default SessionStore;
