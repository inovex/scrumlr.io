import React from 'react';
import LogoutButton from '../../../view/auth/components/LogoutButton';
import errorReporter from '../../../util/errorTracking';
import { auth } from '../../firebase';

const Logout: React.FC = () => {
    const signOut = () => {
        auth.signOut().catch((reason) => {
            errorReporter.reportError(reason, 'Logout/signOut');
        });
    };

    return <LogoutButton signOut={signOut} />;
};

export default Logout;
