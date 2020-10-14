import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import './LoadingScreen.scss';

function LoadingScreen() {

    return (
        <div className='loading-screen'>
            <CircularProgress/>
        </div>
    );
}

export default LoadingScreen;