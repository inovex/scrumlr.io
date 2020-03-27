import React from 'react';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../../types/state';
import { isEmpty, isLoaded } from 'react-redux-firebase';
import { Route, RouteProps } from 'react-router-dom';
import SignIn from '../pages/SignIn';

export const ProtectedRoute: React.FC<RouteProps> = (props) => {
    const authData = useSelector((state: ApplicationState) => state.firebase.auth);
    if (isLoaded(authData) && !isEmpty(authData)) {
        return <Route {...props} />;
    }

    return <SignIn />;
};

export default ProtectedRoute;
