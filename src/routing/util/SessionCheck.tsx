import React, { useState } from 'react';
import { getFirebase, isLoaded } from 'react-redux-firebase';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../../types/state';

const SessionCheck: React.FC = ({ children }) => {
  const [isLoading, setLoading] = useState(true);
  const authData = useSelector((state: ApplicationState) => state.firebase.auth);

  React.useEffect(() => {
    getFirebase()
      .auth()
      .getRedirectResult()
      .finally(() => {
        setLoading(false);
      });

    getFirebase()
      .auth()
      .onAuthStateChanged((authUser) => {
        if (authUser) {
          getFirebase().firestore().collection('users').doc(authUser.uid).set({
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
          });
        }
      });
  }, [authData]);

  if (isLoading || !isLoaded(authData)) {
    return <div>Loading ...</div>;
  }
  return <>{children}</>;
};

export default SessionCheck;
