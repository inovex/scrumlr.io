import React, { useState } from 'react';
import LoginButton from '../../../view/auth/components/LoginButton';
import errorReporter from '../../../util/errorTracking';
import { auth } from '../../firebase';

const Login: React.FC = () => {
    const [isSigningIn, setSigningIn] = useState(false);

    const signInAnonymously = () => {
        setSigningIn(true);
        auth.signInAnonymously()
            .catch((reason) => {
                errorReporter.reportError(reason, 'Login/signInAnonymously');
            })
            .finally(() => {
                setSigningIn(false);
            });
        errorReporter.reportError('reason', 'Login/signInAnonymously');
    };

    return <LoginButton signInAnonymously={signInAnonymously} loading={isSigningIn} />;
};

export default Login;
