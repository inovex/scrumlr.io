import React, { useState } from 'react';
import useStores from '../../useStores';
import { auth } from '../../firebase';
import errorReporter from '../../../util/errorReporter';
import toast from '../../../util/toast';

const Session: React.FC = ({ children }) => {
    const { sessionStore } = useStores();
    const [isLoading, setLoading] = useState(true);

    React.useEffect(() => {
        auth.getRedirectResult()
            .catch((reason) => {
                toast.error('An error occurred during the sign in with this provider.');
                errorReporter.reportError(reason, 'Session/getRedirectResult');
            })
            .finally(() => {
                setLoading(false);
            });

        auth.onAuthStateChanged((authUser) => {
            authUser ? sessionStore.setAuthUser(authUser) : sessionStore.setAuthUser(null);
        });
    }, [sessionStore]);

    if (isLoading) {
        return <div>Loading ...</div>;
    }
    return <>{children}</>;
};

export default Session;
