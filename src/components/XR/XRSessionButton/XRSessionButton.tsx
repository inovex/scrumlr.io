import {Button} from "components/Button";
import {useTranslation} from "react-i18next";
import store from "store";
import {Actions} from "store/action";

const XRSessionButton = () => {
  const {t} = useTranslation();
  const {xr} = navigator;

  if (!xr) return undefined;

  return (
    <Button
      onClick={() => {
        store.dispatch(Actions.setXRSession("AR"));
      }}
    >
      {t("XR.EnterAR")}
    </Button>
  );
};

export default XRSessionButton;
