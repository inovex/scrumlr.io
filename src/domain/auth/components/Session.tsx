import React from 'react';
import useStores from '../../useStores';
import { auth } from '../../firebase';

const Session: React.FC = ({ children }) => {
    const { sessionStore } = useStores();
    React.useEffect(() => {
        auth.onAuthStateChanged((authUser) => {
            authUser ? sessionStore.setAuthUser(authUser) : sessionStore.setAuthUser(null);
        });
    }, [sessionStore]);

    return <>{children}</>;
};

export default Session;
