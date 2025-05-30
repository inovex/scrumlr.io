import React from "react";
import {Navigate} from "react-router";
import {useAppSelector} from "store";

type VerifiedAccountGuardProps = {
  children: React.ReactNode;
  override?: boolean;
};

export const VerifiedAccountGuard = ({children, override}: VerifiedAccountGuardProps) => {
  const isAnonymous = useAppSelector((state) => state.auth.user?.isAnonymous) ?? true;

  const isVerified = () => !isAnonymous || override;

  return isVerified() ? (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
};
