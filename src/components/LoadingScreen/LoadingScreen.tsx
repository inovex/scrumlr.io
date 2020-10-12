import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import './LoadingScreen.css';

function LoadingScreen() {

    return (
        <div className='loading-screen'>
            <CircularProgress/>
        </div>
    );
}

export default LoadingScreen;