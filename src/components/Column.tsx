import React from 'react';
import './Column.scss';

const Column = (props:any, { children }: any) => {
    return (
    <div className={`column ${props.className}`}>
        <div className="column__content">
            {children}
        </div>
    </div>
    );
};
export default Column;