import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import './LoadingScreen.scss';

export interface LoadingScreenProps {
    info?: string;
}

function LoadingScreen(props: LoadingScreenProps) {

    return (
        <div className='loading-screen'>
            <CircularProgress/>
            {props.info ? <p className='loading-screen__info'>{props.info}</p> : <></>}
        </div>
    );
}

export default LoadingScreen;