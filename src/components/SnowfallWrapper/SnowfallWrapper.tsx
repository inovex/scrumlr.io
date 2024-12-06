import {useEffect} from "react";
import Snowfall from "react-snowfall";
import {Toast} from "utils/Toast";
import {setSnowfallNotification} from "store/features";
import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";

export const SnowfallWrapper = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  const snowfallEnabled = useAppSelector((applicationState) => applicationState.view.snowfallEnabled);
  const snowfallNotificationEnabled = useAppSelector((applicationState) => applicationState.view.snowfallNotificationEnabled);
  const currentMonth = new Date().getMonth();

  useEffect(() => {
    if (currentMonth === 11 && snowfallNotificationEnabled) {
      Toast.info({title: t("Snowfall.toastTitle"), message: t("Snowfall.toastMessage")});
    }
    dispatch(setSnowfallNotification(false));
  }, []);

  return (
    <>
      {/** Snowfall is only enabled in December */}
      {snowfallEnabled && currentMonth === 11 && <Snowfall color="#99bcff" />}
    </>
  );
};
