import React from 'react';
import {MobXProviderContext, observer} from "mobx-react";
import {RootStore} from "../store";

function useStores() {
    return React.useContext<RootStore>(MobXProviderContext)
}

const MobxTest: React.FC = observer(() => {
    const { dataStore } = useStores();
    return <div>{dataStore.strings.docs.map(doc => <p>{doc.data.test}</p>)}</div>
});

export default MobxTest;