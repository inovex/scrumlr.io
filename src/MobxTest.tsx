import React from 'react';
import { store } from './store/store';
import { useObserver } from "mobx-react";

const MobxTest: React.FC = () => {
    return useObserver(() => <div>{store.strings.docs.map(doc => <p>{doc.data.test}</p>)}</div>)
};

export default MobxTest;