import {Button} from "components/Button";
import {useTranslation} from "react-i18next";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";

const XRSessionButton = () => {
  const {t} = useTranslation();
  const {xr} = navigator;

  const state = useAppSelector((rootState) => ({
    xrActive: rootState.view.xrActive,
  }));

  if (!xr) return undefined;

  return (
    <Button
      onClick={() => {
        store.dispatch(Actions.setXRActive(!state.xrActive));
      }}
    >
      {t("XR.EnterAR")}
    </Button>
  );
};

export default XRSessionButton;
