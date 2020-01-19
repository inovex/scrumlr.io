import React from 'react';
import LogoutButton from '../../../view/auth/components/LogoutButton';
import { auth } from '../../firebase';

const Logout: React.FC = () => {
    const signOut = () => {
        auth.signOut().catch((reason) => {
            // TODO add proper error handling
            console.error(reason);
        });
    };

    return <LogoutButton signOut={signOut} />;
};

export default Logout;
