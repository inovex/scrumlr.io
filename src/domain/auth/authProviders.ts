import { firebase } from '../firebase';
import authConfig from '../../config/authConfig';

export type AuthProvider = 'apple' | 'google' | 'microsoft' | 'github' | 'saml';
export interface AuthProviderConfiguration {
    provider: firebase.auth.AuthProvider;
    name: string;
}

const enabledAuthProviderMap = new Map<AuthProvider, AuthProviderConfiguration>();
if (authConfig.enableAppleIdentity) {
    enabledAuthProviderMap.set('apple', { provider: new firebase.auth.OAuthProvider('apple.com'), name: 'Apple' });
}
if (authConfig.enableGithubIdentity) {
    enabledAuthProviderMap.set('github', { provider: new firebase.auth.GithubAuthProvider(), name: 'GitHub' });
}
if (authConfig.enableGoogleIdentity) {
    enabledAuthProviderMap.set('google', { provider: new firebase.auth.GoogleAuthProvider(), name: 'Google' });
}
if (authConfig.enableMicrosoftIdentity) {
    enabledAuthProviderMap.set('microsoft', { provider: new firebase.auth.OAuthProvider('microsoft.com'), name: 'Microsoft' });
}
if (authConfig.enableSamlIdentity) {
    enabledAuthProviderMap.set('saml', { provider: new firebase.auth.SAMLAuthProvider(authConfig.samlProviderId), name: authConfig.samlProviderName || 'SSO' });
}

export const authProviders = enabledAuthProviderMap;
export default authProviders;
