import React, { useState } from 'react';
import LoginButton from '../../../view/auth/components/LoginButton';
import errorReporter from '../../../util/errorTracking';
import { auth } from '../../firebase';
import { AuthProvider, authProviders } from '../authProvider';

const Login: React.FC = () => {
    const [isSigningIn, setSigningIn] = useState(false);

    const signInWithProvider = (provider: AuthProvider) => () => {
        setSigningIn(true);
        auth.signInWithRedirect(authProviders[provider])
            .catch((reason) => {
                // TODO show error toast
                errorReporter.reportError(reason, 'Login/signInWithProvider');
            })
            .finally(() => {
                setSigningIn(false);
            });
    };

    const signInAnonymously = () => {
        setSigningIn(true);
        auth.signInAnonymously()
            .catch((reason) => {
                // TODO show error toast
                errorReporter.reportError(reason, 'Login/signInAnonymously');
            })
            .finally(() => {
                setSigningIn(false);
            });
    };

    return (
        <ul>
            <li key="anonymous">
                Anonymous: <LoginButton signIn={signInAnonymously} loading={isSigningIn} />
            </li>
            <li key="google">
                Google: <LoginButton signIn={signInWithProvider('google')} loading={isSigningIn} />
            </li>
        </ul>
    );
};

export default Login;
