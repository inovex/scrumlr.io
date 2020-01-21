import { firebase } from '../firebase';

export interface AuthProviderMap {
    apple: firebase.auth.AuthProvider;
    google: firebase.auth.AuthProvider;
    microsoft: firebase.auth.AuthProvider;
    github: firebase.auth.AuthProvider;
    saml: firebase.auth.AuthProvider;
}
export type AuthProvider = keyof AuthProviderMap;

export const authProviders: AuthProviderMap = {
    apple: new firebase.auth.OAuthProvider('apple.com'),
    google: new firebase.auth.GoogleAuthProvider(),
    microsoft: new firebase.auth.OAuthProvider('microsoft.com'),
    github: new firebase.auth.GithubAuthProvider(),
    saml: new firebase.auth.SAMLAuthProvider('saml.sso')
};
