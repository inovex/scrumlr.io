import React from 'react';

export interface LoginProps {
    signIn: () => void;
    loading?: boolean;

    [key: string]: any;
}

const ProviderLoginButton: React.FC<LoginProps> = ({ signIn, loading, children, ...other }) => {
    return (
        <button {...other} onClick={() => signIn()}>
            {children} {loading ? '(... waiting)' : null}
        </button>
    );
};

export default ProviderLoginButton;
