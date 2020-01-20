import { firebase } from '../firebase';

export interface AuthProviderMap {
    google: firebase.auth.AuthProvider;
    twitter: firebase.auth.AuthProvider;
    github: firebase.auth.AuthProvider;
}
export type AuthProvider = keyof AuthProviderMap;

export const authProviders: AuthProviderMap = {
    google: new firebase.auth.GoogleAuthProvider(),
    twitter: new firebase.auth.TwitterAuthProvider(),
    github: new firebase.auth.GithubAuthProvider()
};
