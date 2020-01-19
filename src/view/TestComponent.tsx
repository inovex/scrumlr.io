import React from 'react';
import { observer } from 'mobx-react';
import useStores from '../domain/useStores';
import Login from '../domain/auth/components/Login';
import Logout from '../domain/auth/components/Logout';

const TestComponent: React.FC = observer(() => {
    const { dataStore, sessionStore } = useStores();
    return (
        <>
            <h1>Session</h1>
            <p>Is Active: {Boolean(sessionStore.authUser).toString()}</p>

            <h2>Test Data</h2>
            <ul>
                {dataStore.strings.docs.map((doc) => (
                    <li key={doc.data.test}>{doc.data.test}</li>
                ))}
            </ul>

            <Login />
            <Logout />
        </>
    );
});

export default TestComponent;
