import React from "react";
import {Navigate} from "react-router";
import {useAppSelector} from "store";

type VerifiedAccountGuardProps = {
  children: React.ReactNode;
};

export const VerifiedAccountGuard = ({children}: VerifiedAccountGuardProps) => {
  const isAnonymous = useAppSelector((state) => state.auth.user?.isAnonymous) ?? true;

  return isAnonymous ? (
    <Navigate to="/" />
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{children}</>
  );
};
