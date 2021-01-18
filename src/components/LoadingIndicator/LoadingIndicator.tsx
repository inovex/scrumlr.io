import * as React from "react";
import './LoadingIndicator.scss';

function LoadingIndicator() {
    return (<div className='loading-indicator'>
        <div className='bounce1'/>
        <div className='bounce2'/>
        <div className='bounce3'/>
    </div>);
}

export default LoadingIndicator;