import React from 'react';
import { observer } from 'mobx-react';
import useStores from '../store/useStores';

const MobxTest: React.FC = observer(() => {
    const { dataStore, sessionStore } = useStores();
    return (
        <>
            <h1>Session</h1>
            <p>Is Active: {Boolean(sessionStore.authUser).toString()}</p>

            <h2>Test Data</h2>
            <ul>
                {dataStore.strings.docs.map((doc) => (
                    <li>{doc.data.test}</li>
                ))}
            </ul>
        </>
    );
});

export default MobxTest;
