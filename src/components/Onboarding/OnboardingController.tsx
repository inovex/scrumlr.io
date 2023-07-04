import {useAppSelector} from "store";
import {isEqual} from "underscore";
import Floater from "react-floater";
import {ReactComponent as StanIcon} from "assets/stan/Stan_ellipse_logo.svg";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {useEffect} from "react";
import onboardingNotes from "./onboardingNotes.en.json";
import "./Onboarding.scss";
import {OnboardingTooltip} from "./Floaters/OnboardingTooltip";
import {OnboardingModalOutro} from "./Floaters/OnboardingModalOutro";

export const OnboardingController = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {phase, step, stepOpen, inUserTask, onboardingColumns, spawnedBoardNotes} = useAppSelector((state) => state.onboarding, isEqual);
  const phaseStep = `${phase}-${step}`;
  const columns = useAppSelector((state) => state.columns, isEqual);
  // const participants = useAppSelector((state) => state.participants);

  useEffect(() => {
    const spawnNotes = (columnName: string) => {
      const column = columnName === "Board" ? columns[0] : columns.find((c) => c.name === columnName);
      if (column) {
        onboardingNotes[columnName].forEach((n: {text: string}) => {
          dispatch(Actions.addNote(column.id, n.text));
        });
      }
      return false;
    };

    if (!spawnedBoardNotes && phase === "board_users") {
      spawnNotes("Board");
      dispatch(Actions.setSpawnedNotes("board", true));
    }
  }, [columns, dispatch, onboardingColumns, phase, spawnedBoardNotes]);

  return (
    <div className="onboarding-controller-wrapper">
      {phase !== "newBoard" ? (
        <div className="onboarding-controller">
          <button
            disabled={phaseStep === "board_column-1"}
            className={`onboarding-button onboarding-back-button 
              ${phaseStep === "board_column-1" ? "onboarding-button-disabled" : ""}`}
            aria-label="Go back one step"
            onClick={() => {
              if (!(phaseStep === "board_column-1")) {
                dispatch(Actions.decrementStep());
              }
            }}
          >
            {t("Onboarding.back")}
          </button>

          <button
            className={`onboarding-icon-button ${!stepOpen ? "onboarding-icon-button_pulse" : ""}`}
            aria-label="Toggle Onboarding Popup"
            onClick={() => {
              dispatch(Actions.toggleStepOpen());
            }}
          >
            <StanIcon />
          </button>

          <button
            className={`onboarding-button onboarding-next-button ${inUserTask || phase === "board_outro" ? "onboarding-button-disabled" : ""}`}
            aria-label="Go to next step"
            onClick={() => {
              if (!(inUserTask || phase === "board_outro")) {
                dispatch(Actions.incrementStep());
              }
            }}
          >
            {t("Onboarding.next")}
          </button>
        </div>
      ) : (
        <button
          className={`onboarding-icon-button onboarding-new_board ${!stepOpen ? "onboarding-icon-button_pulse" : ""}`}
          onClick={() => {
            dispatch(Actions.toggleStepOpen());
          }}
        >
          <StanIcon />
        </button>
      )}

      {phaseStep === "newBoard-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text="You can start with choosing a template and configure it to your liking!" />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22, color: "#0057ff"}, floater: {zIndex: 1000}, container: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "newBoard-2" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="ok" text={t("Onboarding.newBoardSettings")} />}
          target=".new-board__extended:last-child"
          placement="top"
          styles={{arrow: {length: 14, spread: 22, color: "#70e000"}, floater: {zIndex: 1000}, container: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_column-1" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingTooltip
              imgPosition="left"
              image={<StanIcon />}
              buttonType="next"
              text={"You can easily add, change or delete columns. \nYou can also change the visibility or color!"}
            />
          }
          target=".column__header-edit-button"
          placement="bottom"
          styles={{arrow: {length: 14, spread: 22, color: "#ea434b"}, floater: {zIndex: 1000}, container: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_users-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text="Your team can join the board through either the site-link or a QR-Code." />}
          target=".share-button"
          placement="bottom-end"
          styles={{arrow: {length: 14, spread: 22, color: "#ea434b"}, floater: {zIndex: 1000}, container: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_users-2" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text="Be as creative as you want with customizing your user avatar!" />}
          target=".board-users__button--me"
          placement="bottom-end"
          styles={{arrow: {length: 14, spread: 22, color: "#ea434b"}, floater: {zIndex: 1000}, container: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_participant-1" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingTooltip
              imgPosition="left"
              image={<StanIcon />}
              buttonType="next"
              text="All participants can mark themselves as ready or raise their hand to discretely report their status."
            />
          }
          target=".user-menu"
          placement="right"
          styles={{arrow: {length: 14, spread: 22, color: "#0057ff"}, floater: {zIndex: 1000}, container: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_moderator-1" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingTooltip
              imgPosition="left"
              image={<StanIcon />}
              buttonType="next"
              text="As board owner or moderator, use votings to help with making decisions or identifying important topics!"
            />
          }
          target=".admin-menu .menu__items li:nth-child(2)"
          placement="left"
          styles={{arrow: {length: 14, spread: 22, color: "#ffaa5a"}, floater: {zIndex: 1000}, container: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_moderator-2" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text="Keep track of the time used for discussions or votings!" />}
          target=".admin-menu .menu__items li:nth-child(1)"
          placement="left"
          styles={{arrow: {length: 14, spread: 22, color: "#ffaa5a"}, floater: {zIndex: 1000}, container: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_moderator-3" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text="Use the presenter-mode to highlight the notes you click on for your team!" />
          }
          target=".admin-menu .menu__items li:nth-child(3)"
          placement="left"
          styles={{arrow: {length: 14, spread: 22, color: "#ffaa5a"}, floater: {zIndex: 1000}, container: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_outro-1" && <Floater open={stepOpen} component={<OnboardingModalOutro />} placement="center" styles={{floater: {zIndex: 10000}}} />}
    </div>
  );
};
