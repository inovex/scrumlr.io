import { Collection, Document } from 'firestorter';
import { RootStore } from '../rootStore';
import { action, observable } from 'mobx';

export interface TeamDocument {
    owner: string;
}

export interface TeamMemberDocument {
    admin: boolean;
}

class TeamStore {
    public rootStore: RootStore;

    @observable
    public teamId: string | null = null;

    @observable
    public configuration: Document<TeamDocument> | null = null;

    @observable
    public members: Collection<Document<TeamMemberDocument>> | null = null;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action setTeamId = (teamId: string | null) => {
        this.teamId = teamId;
    };
}

export default TeamStore;
