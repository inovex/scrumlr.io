import React from 'react';
import { Link } from 'react-router-dom';

export const Homepage: React.FC = () => {
    return (
        <>
            <section>
                <h2>Start a new session</h2>
                <Link to="/templates">Create new board</Link>
            </section>
        </>
    );
};

export default Homepage;
