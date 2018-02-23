import * as firebase from 'firebase';

export interface AuthProviderMap {
  google: firebase.auth.AuthProvider;
  twitter: firebase.auth.AuthProvider;
  github: firebase.auth.AuthProvider;
}

export type AuthProvider = keyof AuthProviderMap;

export const instantiateAuthProviders = (
  firebase: firebase.app.App
): AuthProviderMap => ({
  google: new firebase.auth['GoogleAuthProvider'](),
  twitter: new firebase.auth['TwitterAuthProvider'](),
  github: new firebase.auth['GithubAuthProvider']()
});
