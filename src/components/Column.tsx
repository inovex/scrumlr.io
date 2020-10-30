import React from 'react';
import './Column.scss';

const Column = ({ children }: any) => (
    <div className="column">
        <div className="column__content">
            {children}
        </div>
    </div>
);

export default Column;