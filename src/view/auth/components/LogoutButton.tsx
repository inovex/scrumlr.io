import React from 'react';

export interface LogoutProps {
    signOut: () => void;
}

const LogoutButton: React.FC<LogoutProps> = ({ signOut }) => {
    return <button onClick={() => signOut()}>Logout</button>;
};

export default LogoutButton;
