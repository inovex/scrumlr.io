import React, { useState } from 'react';
import ProviderLoginButton from '../../../view/auth/components/ProviderLoginButton';
import errorReporter from '../../../util/errorReporter';
import { auth, firebase } from '../../firebase';
import authConfig from '../../../config/authConfig';
import toast from '../../../util/toast';

type AuthProvider = 'apple' | 'google' | 'microsoft' | 'github' | 'saml';
const enabledAuthProviderMap = new Map<AuthProvider, firebase.auth.AuthProvider>();

if (authConfig.enableAppleIdentity) {
    enabledAuthProviderMap.set('apple', new firebase.auth.OAuthProvider('apple.com'));
}
if (authConfig.enableGithubIdentity) {
    enabledAuthProviderMap.set('github', new firebase.auth.GithubAuthProvider());
}
if (authConfig.enableGoogleIdentity) {
    enabledAuthProviderMap.set('google', new firebase.auth.GoogleAuthProvider());
}
if (authConfig.enableMicrosoftIdentity) {
    enabledAuthProviderMap.set('microsoft', new firebase.auth.OAuthProvider('microsoft.com'));
}
if (authConfig.enableSamlIdentity) {
    enabledAuthProviderMap.set('saml', new firebase.auth.SAMLAuthProvider(authConfig.samlProviderId));
}

interface LoginState {
    signingInWith: undefined | AuthProvider | 'anonymous';
    displayName: string;
}

const SignIn: React.FC = () => {
    const [state, setState] = useState<LoginState>({
        signingInWith: undefined,
        displayName: ''
    });

    const signInWithProvider = (provider: AuthProvider) => () => {
        setState({ ...state, signingInWith: provider });
        if (enabledAuthProviderMap.has(provider)) {
            auth.signInWithRedirect(enabledAuthProviderMap.get(provider)!)
                .catch((reason) => {
                    errorReporter.reportError(reason, 'SignIn/signInWithProvider');
                })
                .finally(() => {
                    setState({ ...state, signingInWith: undefined });
                });
        } else {
            errorReporter.reportError(`Auth provider '${provider}' is not allowed`, 'SignIn/signInWithProvider');
        }
    };

    const signInAnonymously = () => {
        setState({ ...state, signingInWith: 'anonymous' });
        auth.signInAnonymously()
            .then((userCredential) => {
                userCredential.user
                    ?.updateProfile({
                        // TODO set real username
                        displayName: 'Dummy user'
                    })
                    .catch((reason) => {
                        errorReporter.reportError(reason, 'SignIn/signInWithProvider');
                    });
            })
            .catch((reason) => {
                toast.error('Unable to sign in. Please check your network connection.');
                errorReporter.reportError(reason, 'SignIn/signInAnonymously');
            })
            .finally(() => {
                setState({ ...state, signingInWith: undefined });
            });
    };

    const genericProps = {
        disabled: state.signingInWith !== undefined
    };

    return (
        <ul>
            {authConfig.enableAnonymousIdentity && (
                <li key="anonymous">
                    <ProviderLoginButton signIn={signInAnonymously} loading={state.signingInWith === 'anonymous'} {...genericProps}>
                        Sign in anonymously
                    </ProviderLoginButton>
                </li>
            )}

            {authConfig.enableGoogleIdentity && (
                <li key="google">
                    <ProviderLoginButton signIn={signInWithProvider('google')} loading={state.signingInWith === 'google'} {...genericProps}>
                        Sign in with Google
                    </ProviderLoginButton>
                </li>
            )}

            {authConfig.enableMicrosoftIdentity && (
                <li key="microsoft">
                    <ProviderLoginButton signIn={signInWithProvider('microsoft')} loading={state.signingInWith === 'microsoft'} {...genericProps}>
                        Sign in with Microsoft
                    </ProviderLoginButton>
                </li>
            )}

            {authConfig.enableGithubIdentity && (
                <li key="github">
                    <ProviderLoginButton signIn={signInWithProvider('github')} loading={state.signingInWith === 'github'} {...genericProps}>
                        Sign in with GitHub
                    </ProviderLoginButton>
                </li>
            )}

            {authConfig.enableAppleIdentity && (
                <li key="apple">
                    <ProviderLoginButton signIn={signInWithProvider('apple')} loading={state.signingInWith === 'apple'} {...genericProps}>
                        Sign in with Apple
                    </ProviderLoginButton>
                </li>
            )}

            {authConfig.enableSamlIdentity && (
                <li key="saml">
                    <ProviderLoginButton signIn={signInWithProvider('saml')} loading={state.signingInWith === 'saml'} disabled={state.signingInWith !== undefined}>
                        Sign in with {authConfig.samlProviderName}
                    </ProviderLoginButton>
                </li>
            )}
        </ul>
    );
};

export default SignIn;
