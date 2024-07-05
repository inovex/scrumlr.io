import {Content, Text} from "@react-three/uikit";
import {Svg} from "@react-three/drei";
import {TabBar, TabBarItem} from "components/apfel/tab-bar";
import CheckIcon from "assets/icons/mark-as-done.svg";
import RaiseHand from "assets/icons/raise-hand.svg";
import BoardReactionIcon from "assets/icons/add-emoji.svg";
import SettingsIcon from "assets/icons/general-settings.svg";
import ExitIcon from "assets/icons/logout.svg";
import {Actions} from "store/action";
import {useDispatch} from "react-redux";
import {useAppSelector} from "store";
import _ from "underscore";
import {memo, useState} from "react";
import {useXR} from "@coconut-xr/natuerlich/react";
import {useDelayedReset} from "utils/hooks/useDelayedReset";
import XRReactionsMenu from "../XRReactionsMenu/XRReactionsMenu";

const XRMenuBarLeft = () => {
  const dispatch = useDispatch();
  const [showBoardReactionsMenu, setShowBoardReactionsMenu] = useState(false);
  const [debounce, resetDebounce] = useDelayedReset<boolean>(false, true, 200);

  const state = useAppSelector(
    (rootState) => ({
      currentUser: rootState.participants!.self,
      moderation: rootState.view.moderating,
      hotkeysAreActive: rootState.view.hotkeysAreActive,
      activeTimer: !!rootState.board.data?.timerEnd,
      activeVoting: !!rootState.votings.open,
    }),
    _.isEqual
  );

  const isReady = state.currentUser.ready;
  const {raisedHand} = state.currentUser;
  const {session} = useXR();

  const exitAR = () => {
    if (session?.frameRate) session.end().then(() => dispatch(Actions.setXRActive(false)));
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

  return (
    <>
      <TabBar positionType="absolute" positionLeft={-72} positionTop="25%" zIndexOffset={16} transformTranslateZ={16}>
        <TabBarItem
          value="1"
          icon={
            <Content>
              <Svg src={CheckIcon} />
            </Content>
          }
          onClick={toggleReadyState}
        >
          <Text>{!isReady ? "Mark me as done" : "Unmark me as done"}</Text>
        </TabBarItem>
        <TabBarItem
          value="2"
          icon={
            <Content>
              <Svg src={RaiseHand} />
            </Content>
          }
          onClick={toggleRaiseHand}
        >
          <Text>{!raisedHand ? "Raise your hand" : "Lower your hand"}</Text>
        </TabBarItem>
        <TabBarItem
          value="3"
          icon={
            <Content>
              <Svg src={BoardReactionIcon} />
            </Content>
          }
          onClick={toggleBoardReactionsMenu}
        >
          <Text>React</Text>
        </TabBarItem>
        <TabBarItem
          value="4"
          icon={
            <Content>
              <Svg src={SettingsIcon} />
            </Content>
          }
        >
          <Text>Settings</Text>
        </TabBarItem>
        <TabBarItem
          value="5"
          icon={
            <Content>
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
