import React from 'react'
import {Redirect, Route, RouteProps} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isLoaded, isEmpty } from 'react-redux-firebase';
import {ApplicationState} from '../store/ApplicationState';
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";

function PrivateRoute(props: RouteProps) {
  const auth = useSelector((state: ApplicationState) => state.firebase.auth);
  if (isLoaded(auth)) {
     if (isEmpty(auth)) {
       return <Redirect to={{pathname: '/login', state: {from: props.location}}}/>;
     } else {
       return <Route {...props} />;
     }
  }
  return <LoadingScreen/>;
}

export default PrivateRoute;