import {Svg, Text} from "@react-three/uikit";
import {TabBar, TabBarItem} from "components/apfel/tab-bar";
import CheckIcon from "assets/icon-check.svg";
import RaiseHand from "assets/icon-hand.svg";
import BoardReactionIcon from "assets/icon-add-board-reaction.svg";
import SettingsIcon from "assets/icon-settings.svg";
import {Actions} from "store/action";
import {useDispatch} from "react-redux";
import {useAppSelector} from "store";
import _ from "underscore";
import {useState} from "react";
import {FONT_COLOR, getColorFromName} from "components/XR/xr-constants";
import XRReactionsMenu from "../XRReactionsMenu/XRReactionsMenu";

const XRMenuBarLeft = () => {
  const dispatch = useDispatch();
  const [showBoardReactionsMenu, setShowBoardReactionsMenu] = useState(false);

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

  const toggleReadyState = () => {
    dispatch(Actions.setUserReadyStatus(state.currentUser.user.id, !isReady));
  };

  const toggleRaiseHand = () => {
    dispatch(Actions.setRaisedHand(state.currentUser.user.id, !raisedHand));
  };

  const toggleBoardReactionsMenu = () => {
    setShowBoardReactionsMenu((show) => !show);
  };

  return (
    <>
      <TabBar positionType="absolute" positionLeft={-72} positionTop="25%" zIndexOffset={16} transformTranslateZ={16}>
        <TabBarItem value="1" icon={<Svg src={CheckIcon} color={!isReady ? FONT_COLOR : getColorFromName("grooming-green")} />} onClick={toggleReadyState}>
          <Text>{!isReady ? "Mark me as done" : "Unmark me as done"}</Text>
        </TabBarItem>
        <TabBarItem value="2" icon={<Svg src={RaiseHand} color={!raisedHand ? FONT_COLOR : getColorFromName("poker-purple")} />} onClick={toggleRaiseHand}>
          <Text>{!raisedHand ? "Raise your hand" : "Lower your hand"}</Text>
        </TabBarItem>
        <TabBarItem value="3" icon={<Svg src={BoardReactionIcon} />} onClick={toggleBoardReactionsMenu}>
          <Text>React</Text>
        </TabBarItem>
        <TabBarItem value="4" icon={<Svg src={SettingsIcon} />}>
          <Text>Settings</Text>
        </TabBarItem>
      </TabBar>
      {showBoardReactionsMenu && <XRReactionsMenu />}
    </>
  );
};

export default XRMenuBarLeft;
