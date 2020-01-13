import { RootStore } from './index';
import {Collection, Document} from "firestorter";

class DataStore {
    public rootStore: RootStore;

    public strings: Collection<Document<{ test: string }>> = new Collection<Document<{test: string}>>('strings');

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }
}

export default DataStore;