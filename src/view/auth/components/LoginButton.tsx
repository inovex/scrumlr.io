import React from 'react';

export interface LoginProps {
    signIn: () => void;
    loading?: boolean;
}

const LoginButton: React.FC<LoginProps> = ({ signIn, loading }) => {
    return <button onClick={() => signIn()}>Login {loading ? '(... waiting)' : null}</button>;
};

export default LoginButton;
