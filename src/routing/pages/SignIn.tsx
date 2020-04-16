import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useSelector } from 'react-redux';
import { isEmpty, isLoaded } from 'react-redux-firebase';
import firebase from 'firebase';
import defaultTo from 'lodash/defaultTo';
import { signInAnonymously, signInWithProvider, signOut } from '../../domain/auth';
import { ApplicationState } from '../../types/state';
import getRandomName from '../../util/usernameGenerator';
import toBoolean from '../../util/toBoolean';

export interface SignInState {
  displayName?: string;
  signingIn: boolean;
}

const enableAnonymousIdentity = toBoolean(defaultTo(process.env.REACT_APP_ENABLE_ANONYMOUS_IDENTITY, true));
const enableGoogleIdentity = toBoolean(defaultTo(process.env.REACT_APP_ENABLE_GOOGLE_IDENTITY, false));
const enableAppleIdentity = toBoolean(defaultTo(process.env.REACT_APP_ENABLE_APPLE_IDENTITY, false));
const enableMicrosoftIdentity = toBoolean(defaultTo(process.env.REACT_APP_ENABLE_MICROSOFT_IDENTITY, false));
const enableGithubIdentity = toBoolean(defaultTo(process.env.REACT_APP_ENABLE_GITHUB_IDENTITY, false));

export const SignIn: React.FC = () => {
  const randomName = getRandomName();

  const [state, setState] = useState<SignInState>({
    signingIn: false,
  });

  const authData = useSelector((store: ApplicationState) => store.firebase.auth);
  if (isLoaded(authData) && !isEmpty(authData)) {
    return <Button onClick={signOut}>Sign out</Button>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signIn = <T extends any>(signInMethod: (param: T) => Promise<void>, param: T) => () => {
    setState({ ...state, signingIn: true });
    return signInMethod(param).finally(() => {
      setState({ ...state, signingIn: false });
    });
  };

  return (
    <div>
      <h2>Sign In</h2>
      {enableAnonymousIdentity && (
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
      )}

      <div>
        {enableGoogleIdentity && <Button onClick={signIn(signInWithProvider, new firebase.auth.GoogleAuthProvider())}>Sign in with Google</Button>}
        {enableMicrosoftIdentity && <Button onClick={signIn(signInWithProvider, new firebase.auth.OAuthProvider('microsoft.com'))}>Sign in with Microsoft</Button>}
        {enableGithubIdentity && <Button onClick={signIn(signInWithProvider, new firebase.auth.GithubAuthProvider())}>Sign in with GitHub</Button>}
        {enableAppleIdentity && <Button onClick={signIn(signInWithProvider, new firebase.auth.OAuthProvider('apple.com'))}>Sign in with Apple</Button>}
      </div>
    </div>
  );
};

export default SignIn;
