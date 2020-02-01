import React, { useState } from 'react';
import ProviderLoginButton from '../../../view/auth/components/ProviderLoginButton';
import errorReporter from '../../../util/errorReporter';
import { auth } from '../../firebase';
import authConfig from '../../../config/authConfig';
import toast from '../../../util/toast';
import './SignIn.scss';
import authProviders, {AuthProvider} from "../authProviders";

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
        if (authProviders.has(provider)) {
            auth.signInWithRedirect(authProviders.get(provider)!.provider)
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

    const providerButtons: JSX.Element[] = [];
    authProviders.forEach((config, key) => {
        providerButtons.push((
            <li key={key}>
                <ProviderLoginButton signIn={signInWithProvider(key)} loading={state.signingInWith === key} {...genericProps}>
                    Sign in with {config.name}
                </ProviderLoginButton>
            </li>
        ))
    });

    return (
        <ul>
            {providerButtons}
            {authConfig.enableAnonymousIdentity && (
                <li key="anonymous">
                    <span>or</span>
                    <label htmlFor="displayName" className="SignIn__anonymous-login__label">
                        Sign in with just a name
                    </label>
                    <input
                        id="displayName"
                        value={state.displayName}
                        onChange={(e) => {
                            setState({ ...state, displayName: e.target.value });
                        }}
                    />

                    <ProviderLoginButton signIn={signInAnonymously} loading={state.signingInWith === 'anonymous'} {...genericProps}>
                        Sign in anonymously
                    </ProviderLoginButton>
                </li>
            )}
        </ul>
    );
};

export default SignIn;
