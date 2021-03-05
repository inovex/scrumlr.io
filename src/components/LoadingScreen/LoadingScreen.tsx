import './LoadingScreen.scss';
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";

function LoadingScreen() {

    return (
        <div className='loading-screen'>
            <LoadingIndicator/>
        </div>
    );
}

export default LoadingScreen;