import React, { useState } from 'react';
import LoginButton from '../../../view/auth/components/LoginButton';
import { auth } from '../../firebase';

const Login: React.FC = () => {
    const [isSigningIn, setSigningIn] = useState(false);

    const signInAnonymously = () => {
        setSigningIn(true);
        auth.signInAnonymously()
            .catch((reason) => {
                // TODO add proper error handling
                console.error(reason);
            })
            .finally(() => {
                setSigningIn(false);
            });
    };

    return <LoginButton signInAnonymously={signInAnonymously} loading={isSigningIn} />;
};

export default Login;
