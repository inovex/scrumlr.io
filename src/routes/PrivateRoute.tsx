import React from 'react'
import {Redirect, Route} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isLoaded, isEmpty } from 'react-redux-firebase';
import {ApplicationState} from '../store/ApplicationState';
import CircularProgress from '@material-ui/core/CircularProgress'; 

function PrivateRoute(props: any) {
  const auth = useSelector((state: ApplicationState) => state.firebase.auth);
  if (isLoaded(auth)) {
     if (isEmpty(auth)) {
       return <Redirect to='/new'/>;
     } else {
       return <Route {...props} />;
     }
  }
  return <CircularProgress />;
};

export default PrivateRoute;