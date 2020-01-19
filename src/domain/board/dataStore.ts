import { Collection, Document } from 'firestorter';
import { RootStore } from '../rootStore';

class DataStore {
    public rootStore: RootStore;

    public strings: Collection<Document<{ test: string }>> = new Collection<Document<{ test: string }>>('strings');

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}

export default DataStore;
