import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import getRandomName from '../../util/usernameGenerator';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../../types/state';
import { getFirebase, isEmpty, isLoaded } from 'react-redux-firebase';
import firebase from 'firebase';

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
        const signOut = () => {
            getFirebase().auth().signOut();
        };

        return <Button onClick={signOut}>Sign out</Button>;
    }

    const signInAnonymously = () => {
        setState({ ...state, signingIn: true });
        getFirebase()
            .auth()
            .signInAnonymously()
            .then((userCredential) => {
                userCredential.user
                    ?.updateProfile({
                        displayName: state.displayName || randomName
                    })
                    .then(() => {
                        const currentUser = getFirebase().auth().currentUser!;
                        getFirebase().firestore().collection('users').doc(currentUser.uid).update({
                            displayName: currentUser.displayName
                        });
                    });
            })
            .finally(() => {
                setState({ ...state, signingIn: false });
            });
    };

    const signInWithGoogle = () => {
        setState({ ...state, signingIn: true });
        getFirebase()
            .auth()
            .signInWithRedirect(new firebase.auth.GoogleAuthProvider())
            .finally(() => {
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
                <Button disabled={state.signingIn} onClick={signInAnonymously}>
                    Sign in anonymously
                </Button>
            </div>
            <div>
                <Button onClick={signInWithGoogle}>Sign in with Google</Button>
            </div>
        </div>
    );
};

export default SignIn;
