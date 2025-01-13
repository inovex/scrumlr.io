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
    // Festive greetings are displayed only once, when the month changes to December
    if (currentMonth === 11 && snowfallNotificationEnabled) {
      Toast.info({title: t("Snowfall.toastTitle"), message: t("Snowfall.toastMessage")});
    }
    dispatch(setSnowfallNotification(false));
  }, [currentMonth, dispatch, snowfallNotificationEnabled, t]);

  // Snowfall is enabled only in December and January
  const isDecemberOrJanuary = currentMonth === 11 || currentMonth === 0;

  // If snowfall is disabled or it's not December or January, return null
  if (!snowfallEnabled || !isDecemberOrJanuary) {
    return null;
  }

  return <Snowfall color="#99bcff" />;
};
