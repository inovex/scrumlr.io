import {Content, Text} from "@react-three/uikit";
import {Svg} from "@react-three/drei";
import {TabBar, TabBarItem} from "components/apfel/tab-bar";
import CheckIcon from "assets/icons/mark-as-done.svg";
import RaiseHand from "assets/icons/raise-hand.svg";
import BoardReactionIcon from "assets/icons/add-emoji.svg";
import Hidden from "assets/icons/hidden.svg";
import Visible from "assets/icons/visible.svg";
/* import SettingsIcon from "assets/icons/general-settings.svg"; */
import ExitIcon from "assets/icons/logout.svg";
import {Actions} from "store/action";
import {useDispatch} from "react-redux";
import {useAppSelector} from "store";
import _ from "underscore";
import {memo, useState} from "react";
import {useXR} from "@coconut-xr/natuerlich/react";
import {useDelayedReset} from "utils/hooks/useDelayedReset";
import {Color, MeshBasicMaterial} from "three";
import {getColorFromName} from "components/XR/xr-constants";
import XRReactionsMenu from "../XRReactionsMenu/XRReactionsMenu";

const inactiveMaterial = new MeshBasicMaterial({color: new Color("#FFFFFF")});
const activeMaterial = new MeshBasicMaterial({color: new Color(getColorFromName("grooming-green"))});

const XRMenuBarLeft = () => {
  const dispatch = useDispatch();
  const [showBoardReactionsMenu, setShowBoardReactionsMenu] = useState(false);
  const [debounce, resetDebounce] = useDelayedReset<boolean>(false, true, 200);

  const state = useAppSelector(
    (rootState) => ({
      currentUser: rootState.participants!.self,
      xrSession: rootState.view.xrSession,
      xrLookAt: rootState.view.xrLookAt,
    }),
    _.isEqual
  );

  const isReady = state.currentUser.ready;
  const {raisedHand} = state.currentUser;
  const {session} = useXR();

  const exitAR = () => {
    if (session?.frameRate) session.end().then(() => dispatch(Actions.setXRSession(undefined)));
  };

  const toggleReadyState = () => {
    dispatch(Actions.setUserReadyStatus(state.currentUser.user.id, !isReady));
  };

  const toggleRaiseHand = () => {
    dispatch(Actions.setRaisedHand(state.currentUser.user.id, !raisedHand));
  };

  const toggleBoardReactionsMenu = () => {
    if (!debounce) {
      setShowBoardReactionsMenu(!showBoardReactionsMenu);
      resetDebounce();
    }
  };

  const toggleXRLookAt = () => {
    dispatch(Actions.setXRLookAt(!state.xrLookAt));
  };

  return (
    <>
      <TabBar positionType="absolute" positionLeft={-72} positionTop="16%" zIndexOffset={16} transformTranslateZ={16}>
        <TabBarItem
          value="1"
          icon={
            <Content transformTranslateZ={1}>
              <Svg src={CheckIcon} strokeMaterial={!isReady ? inactiveMaterial : activeMaterial} />
            </Content>
          }
          onClick={toggleReadyState}
        >
          <Text>{!isReady ? "Mark me as done" : "Unmark me as done"}</Text>
        </TabBarItem>
        <TabBarItem
          value="2"
          icon={
            <Content transformTranslateZ={1}>
              <Svg src={RaiseHand} strokeMaterial={!raisedHand ? inactiveMaterial : activeMaterial} />
            </Content>
          }
          onClick={toggleRaiseHand}
        >
          <Text>{!raisedHand ? "Raise your hand" : "Lower your hand"}</Text>
        </TabBarItem>
        <TabBarItem
          value="3"
          icon={
            <Content transformTranslateZ={1}>
              <Svg
                src={BoardReactionIcon}
                strokeMaterial={!showBoardReactionsMenu ? inactiveMaterial : activeMaterial}
                fillMaterial={!showBoardReactionsMenu ? inactiveMaterial : activeMaterial}
              />
            </Content>
          }
          onClick={toggleBoardReactionsMenu}
        >
          <Text>React</Text>
        </TabBarItem>
        <TabBarItem
          value="4"
          icon={<Text transformTranslateZ={1}>{state.xrSession === "AR" ? "VR" : "AR"}</Text>}
          onClick={() => dispatch(Actions.setXRSession(state.xrSession === "AR" ? "VR" : "AR"))}
        >
          <Text>Environment</Text>
        </TabBarItem>
        <TabBarItem
          value="5"
          icon={
            <Content transformTranslateZ={1}>
              <Svg src={state.xrLookAt ? Hidden : Visible} strokeMaterial={!state.xrLookAt ? inactiveMaterial : activeMaterial} />
            </Content>
          }
          onClick={toggleXRLookAt}
        >
          <Text>Auto Follow</Text>
        </TabBarItem>
        <TabBarItem
          value="6"
          icon={
            <Content transformTranslateZ={1}>
              <Svg src={ExitIcon} />
            </Content>
          }
          onClick={() => session && exitAR()}
        >
          <Text>Exit</Text>
        </TabBarItem>
      </TabBar>
      {showBoardReactionsMenu && <XRReactionsMenu close={() => setShowBoardReactionsMenu(false)} />}
    </>
  );
};

export default memo(XRMenuBarLeft);
