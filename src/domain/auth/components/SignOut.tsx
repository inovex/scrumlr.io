import React from 'react';
import SignOutButton from '../../../view/auth/components/SignOutButton';
import errorReporter from '../../../util/errorReporter';
import { auth } from '../../firebase';

const SignOut: React.FC = () => {
    const signOut = () => {
        auth.signOut().catch((reason) => {
            errorReporter.reportError(reason, 'SignOut/signOut');
        });
    };

    return <SignOutButton signOut={signOut} />;
};

export default SignOut;
