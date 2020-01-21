import React from 'react';

export interface LogoutProps {
    signOut: () => void;
}

const SignOutButton: React.FC<LogoutProps> = ({ signOut }) => {
    return <button onClick={() => signOut()}>Logout</button>;
};

export default SignOutButton;
