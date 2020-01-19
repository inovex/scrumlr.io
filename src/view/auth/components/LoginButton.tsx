import React from 'react';

export interface LoginProps {
    signInAnonymously: () => void;
    loading?: boolean;
}

const LoginButton: React.FC<LoginProps> = ({ signInAnonymously, loading }) => {
    return <button onClick={() => signInAnonymously()}>Login {loading ? '(... waiting)' : null}</button>;
};

export default LoginButton;
