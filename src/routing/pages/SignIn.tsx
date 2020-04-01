import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import getRandomName from '../../util/usernameGenerator';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../../types/state';
import { isEmpty, isLoaded } from 'react-redux-firebase';
import firebase from 'firebase';
import { signInAnonymously, signInWithProvider, signOut } from '../../domain/auth';

export interface SignInState {
    displayName?: string;
    signingIn: boolean;
}

export const SignIn: React.FC = () => {
    const randomName = getRandomName();

    const [state, setState] = useState<SignInState>({
        signingIn: false
    });

    const authData = useSelector((state: ApplicationState) => state.firebase.auth);
    if (isLoaded(authData) && !isEmpty(authData)) {
        return <Button onClick={signOut}>Sign out</Button>;
    }

    const signIn = <T extends any>(signInMethod: (param: T) => Promise<void>, param: T) => () => {
        setState({ ...state, signingIn: true });
        return signInMethod(param).finally(() => {
            setState({ ...state, signingIn: false });
        });
    };

    return (
        <div>
            <h2>Sign In</h2>
            <div>
                <TextField
                    label="Display name"
                    placeholder={randomName}
                    onChange={(event) => {
                        setState({ ...state, displayName: event.target.value });
                    }}
                />
                <Button disabled={state.signingIn} onClick={signIn(signInAnonymously, state.displayName || randomName)}>
                    Sign in anonymously
                </Button>
            </div>
            <div>
                <Button onClick={signIn(signInWithProvider, new firebase.auth.GoogleAuthProvider())}>Sign in with Google</Button>
            </div>
        </div>
    );
};

export default SignIn;
