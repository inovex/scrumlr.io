import * as React from 'react';
import * as firebase from 'firebase';
import useStores from '../store/useStores';

const Session: React.FC = ({ children }) => {
    const { sessionStore } = useStores();
    React.useEffect(() => {
        firebase.auth().onAuthStateChanged((authUser) => {
            authUser ? sessionStore.setAuthUser(authUser) : sessionStore.setAuthUser(null);
        });
    }, [sessionStore]);

    return <>{children}</>;
};

export default Session;
