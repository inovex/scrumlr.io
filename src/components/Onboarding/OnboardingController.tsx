import {useAppSelector} from "store";
import {isEqual} from "underscore";
import Floater from "react-floater";
import {ReactComponent as StanIcon} from "assets/stan/Stan_ellipse_logo.svg";
import {shallowEqual, useDispatch} from "react-redux";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {useEffect} from "react";
import {onboardingAuthors} from "types/onboardingNotes";
import {OnboardingBase} from "./OnboardingBase";
import onboardingNotes from "./onboardingNotes.en.json";
import "./Onboarding.scss";

export const OnboardingController = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const phase = useAppSelector((state) => state.onboarding.phase, isEqual);
  const step = useAppSelector((state) => state.onboarding.step, isEqual);
  const phaseStep = `${phase}-${step}`;
  const stepOpen = useAppSelector((state) => state.onboarding.stepOpen, isEqual);
  const inUserTask = useAppSelector((state) => state.onboarding.inUserTask, isEqual);
  const columns = useAppSelector((state) => state.columns, shallowEqual);

  useEffect(() => {
    const spawnNotes = (columnName: string) => {
      const column = columns.find((c) => c.name === columnName);
      if (column) {
        let index = 0;
        onboardingNotes[columnName].forEach((n: {text: string; author: string}) => {
          setTimeout(() => {
            dispatch(Actions.addOnboardingNote(column?.id ?? "", n.text, n.author));
          }, index * 500);
          index++;
        });
      }
    };
    switch (phaseStep) {
      /* phase "intro" handles itself - phase "none" has no onboarding activities */
      case "newBoard-1":
        break;
      case "newBoard-2":
        break;
      case "board_check_in-1": // welcome
        break;
      case "board_check_in-2": // add column task
        dispatch(Actions.setInUserTask(true));
        break;
      case "board_check_in-3": // invite team
        dispatch(Actions.setInUserTask(false));
        onboardingAuthors.forEach((oa) => {
          dispatch(Actions.createdParticipant(oa));
        });
        break;
      case "board_check_in-4": // simulate team adding notes
        spawnNotes("Check-In");
        dispatch(Actions.incrementStep());
        break;
      case "board_data-1": // welcome
        break;
      case "board_data-2":
        // in this step, the "fake" notes for the Mad/Sad/Glad columns are spawned
        spawnNotes("Mad");
        setTimeout(() => {
          spawnNotes("Sad");
        }, 500);
        setTimeout(() => {
          spawnNotes("Glad");
        }, 1500);
        dispatch(Actions.incrementStep());
        break;
      case "board_insights":
        break;
      case "board_actions":
        break;
      case "board_check_out":
        break;
      case "outro":
        break;
      default:
        break;
    }
  }, [phaseStep, columns, dispatch]);

  return (
    <div className="onboarding-controller-wrapper">
      {phase !== "newBoard" ? (
        <div className="onboarding-controller">
          <button
            className="onboarding-button onboarding-skip-button"
            aria-label="Skip this phase"
            onClick={() => {
              dispatch(Actions.incrementStep(100));
            }}
          >
            {t("Onboarding.skip")}
          </button>

          <button
            className="onboarding-icon-button"
            aria-label="Toggle Onboarding Popup"
            onClick={() => {
              dispatch(Actions.toggleStepOpen());
            }}
          >
            <StanIcon />
          </button>

          <button
            className={`onboarding-button onboarding-next-button ${inUserTask ? "onboarding-button-disabled" : ""}`}
            aria-label="Go to next step"
            onClick={() => {
              if (!inUserTask) {
                dispatch(Actions.incrementStep());
              }
            }}
          >
            {t("Onboarding.next")}
          </button>
        </div>
      ) : (
        <button
          className="onboarding-icon-button onboarding-new_board"
          onClick={() => {
            dispatch(Actions.toggleStepOpen());
          }}
        >
          <StanIcon />
        </button>
      )}

      {/* For some reason, updating the position didn't work with a switch case outside the return but works this way:
          TODO: find reason and refactor this if time is left at the end of development */}
      {phaseStep === "newBoard-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingBase text={t("Onboarding.newBoardWelcome")} isExercisePrompt={false} />}
          target=".new-board__mode-selection"
          placement="right"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "newBoard-2" && (
        <Floater
          open={stepOpen}
          component={<OnboardingBase text={t("Onboarding.newBoardWelcome")} isExercisePrompt={false} />}
          target=".new-board__extended"
          placement="right-end"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_in-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingBase text={t("Onboarding.checkInWelcome")} isExercisePrompt={false} />}
          placement="center"
          target=".board"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_in-2" && (
        <Floater
          open={stepOpen}
          component={<OnboardingBase text={t("Onboarding.checkAddColumn")} isExercisePrompt />}
          target=".column__header-edit-button-icon"
          placement="right"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_in-3" && (
        <Floater
          open={stepOpen}
          component={<OnboardingBase text={t("Onboarding.checkInAddTeam")} isExercisePrompt={false} />}
          target=".share-button"
          placement="bottom-end"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {/* board_check_in-4 and board_check_in-5 just handle spawning notes */}
      {phaseStep === "board_data-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingBase text={t("Onboarding.dataWelcome")} isExercisePrompt={false} />}
          target=".column + .column"
          placement="left"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {/* board_data-2 and board_data-3 just handle spawning notes */}
      {phaseStep === "board_data-4" && (
        <Floater
          open={stepOpen}
          component={<OnboardingBase text={t("Onboarding.dataCardsAdded")} isExercisePrompt={false} />}
          placement="center"
          target=".board"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_data-5" && (
        <Floater
          open={stepOpen}
          component={<OnboardingBase text={t("Onboarding.dataStacks")} isExercisePrompt />}
          target=".column + .column"
          placement="left"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_insights-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingBase text={t("Onboarding.insightsWelcome")} isExercisePrompt />}
          target=".column + .column"
          placement="left"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
    </div>
  );
};
