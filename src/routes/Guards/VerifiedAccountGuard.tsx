import React from "react";
import {Navigate} from "react-router";

type VerifiedAccountGuardProps = {
  children: React.ReactNode;
};

export const VerifiedAccountGuard = ({children}: VerifiedAccountGuardProps) => {
  const isAuthenticated = (): boolean => 
    // Replace this with your actual authentication logic
     false // or false based on your logic
  ;

  return isAuthenticated() ? (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
};
