import {useAppSelector} from "store";
import {isEqual} from "underscore";
import Floater from "react-floater";
import {ReactComponent as StanIcon} from "assets/stan/Stan_ellipse_logo.svg";
import {ReactComponent as GatheringDataImg} from "assets/onboarding/Gathering-Data-Image.svg";
import {ReactComponent as GenerateInsights} from "assets/onboarding/Generate-Insights-Image.svg";
import setStageImg from "assets/onboarding/SetStage-Image.png";
import decideImg from "assets/onboarding/Decide-Image.png";
import {ReactComponent as MikeHappy} from "assets/onboarding/Mike_Happy.svg";
import stanDrink from "assets/stan/Slooth_drink.png";
import stanComputer from "assets/stan/Stan_computer.png";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {useEffect} from "react";
import {onboardingAuthors} from "types/onboardingNotes";
import onboardingNotes from "./onboardingNotes.en.json";
import "./Onboarding.scss";
import {OnboardingModal} from "./Floaters/OnboardingModal";
import {OnboardingChat} from "./Floaters/OnboardingChat";
import {OnboardingTooltip} from "./Floaters/OnboardingTooltip";
import {OnboardingModalRetro} from "./Floaters/OnboardingModalRetro";

export const OnboardingController = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const phase = useAppSelector((state) => state.onboarding.phase, isEqual);
  const step = useAppSelector((state) => state.onboarding.step, isEqual);
  const phaseStep = `${phase}-${step}`;
  const stepOpen = useAppSelector((state) => state.onboarding.stepOpen, isEqual);
  const inUserTask = useAppSelector((state) => state.onboarding.inUserTask, isEqual);
  const onboardingColumns = useAppSelector((state) => state.onboarding.onboardingColumns);
  const columns = useAppSelector((state) => state.columns, isEqual);
  const participants = useAppSelector((state) => state.participants);

  useEffect(() => {
    if (phase !== "intro" && phase !== "newBoard" && phase !== "none" && phaseStep !== "board_check_in-1" && participants && participants.others.length === 0) {
      dispatch(Actions.setParticipants([...onboardingAuthors, participants.self]));
    }
  }, [dispatch, participants, phase, phaseStep]);

  useEffect(() => {
    const spawnNotes = (columnName: string) => {
      const column = columns.find((c) => c.name === columnName);
      if (column) {
        let index = 0;
        onboardingNotes[columnName].forEach((n: {text: string; author: string; votes: number}) => {
          setTimeout(() => {
            dispatch(Actions.addOnboardingNote(column?.id ?? "", n.text, n.author, n.votes));
          }, index * 500);
          index++;
        });
      }
    };

    const actionColumnVisible = (): boolean => {
      const actionColumnID = onboardingColumns.find((oc) => oc.name === "Actions")?.id;
      if (!actionColumnID) {
        return false;
      }
      const actionColumnVisibility = columns.find((c) => c.id === actionColumnID)?.visible;
      if (actionColumnVisibility) {
        return true;
      }
      return false;
    };

    switch (phaseStep) {
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
      case "board_data-5":
        dispatch(Actions.setInUserTask(true));
        if (participants?.self.ready) {
          dispatch(Actions.setInUserTask(false));
        }
        break;
      case "board_insights-2":
        dispatch(Actions.setInUserTask(true));
        break;
      case "board_insights-4":
        dispatch(Actions.setFakeVotesOpen(true));
        break;
      case "board_actions-2":
        dispatch(Actions.setInUserTask(true));
        if (actionColumnVisible()) {
          dispatch(Actions.setInUserTask(false));
        }
        break;
      case "board_actions-3":
        spawnNotes("Actions");
        dispatch(Actions.incrementStep());
        break;
      case "outro-1":
        dispatch(Actions.setInUserTask(true));
        break;
      default:
        break;
    }
  }, [phaseStep, columns, dispatch, onboardingColumns, participants?.self.ready]);

  return (
    <div className="onboarding-controller-wrapper">
      {phase !== "newBoard" ? (
        <div className="onboarding-controller">
          <button
            className={`onboarding-button onboarding-skip-button ${phase === "outro" ? "onboarding-button-disabled" : ""}`}
            aria-label="Skip this step"
            onClick={() => {
              switch (phaseStep) {
                case "outro-1":
                  break;
                case "board_data-5":
                  dispatch(Actions.incrementStep());
                  dispatch(Actions.setInUserTask(false));
                  break;
                case "board_insights-2":
                  dispatch(Actions.incrementStep(2));
                  dispatch(Actions.setInUserTask(false));
                  break;
                case "board_actions-2":
                  dispatch(Actions.incrementStep());
                  dispatch(Actions.setInUserTask(false));
                  break;
                default:
                  dispatch(Actions.incrementStep());
                  break;
              }
            }}
          >
            {t("Onboarding.skip")}
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

      {phaseStep === "newBoard-1" && <Floater open={stepOpen} component={<OnboardingModalRetro />} placement="center" styles={{floater: {zIndex: 10000}}} />}
      {phaseStep === "newBoard-2" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingModal
              textContent={t("Onboarding.newBoardWelcome")}
              title="Preparation is Key!"
              hasNextButton
              image={<img src={stanComputer} alt="Stan sitting in front of a computer" />}
            />
          }
          placement="center"
          styles={{floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "newBoard-3" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text={t("Onboarding.newBoardSettings")} />}
          target=".new-board__extended:last-child"
          placement="right-end"
          styles={{arrow: {length: 14, spread: 22, color: "#0057ff"}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "newBoard-4" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="ok" text={t("Onboarding.newBoardCreate")} />}
          target=".new-board"
          placement="right"
          styles={{arrow: {length: 14, spread: 22, color: "#0057ff"}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_in-1" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingModal
              textContent={t("Onboarding.checkInWelcome")}
              title="Phase 1: Set the Stage"
              image={<img src={setStageImg} alt="Whiteboard with set-the-stage activity icons" />}
            />
          }
          placement="center"
          styles={{floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_in-2" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text="I already invited Mike's team to the board!" />}
          placement="bottom-end"
          target=".share-button"
          styles={{arrow: {length: 14, spread: 18, color: "#ea434b"}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_in-3" && (
        <Floater
          open={stepOpen}
          component={<OnboardingChat chatName="Chat_Check-In" title="Mike's Set-The-Stage: Song Title" />}
          placement="center"
          styles={{floater: {zIndex: 10000}}}
        />
      )}
      {/* board_check_in-4 and board_check_in-5 just handle spawning notes */}
      {phaseStep === "board_data-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingModal textContent={t("Onboarding.gatherDataWelcome")} title="Phase 2: Gather Data/Topics" image={<GatheringDataImg />} />}
          placement="center"
          styles={{floater: {zIndex: 10000}}}
        />
      )}
      {/* board_data-2 and board_data-3 just handle spawning notes */}
      {phaseStep === "board_data-4" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="next" text={t("Onboarding.dataCardsAdded")} />}
          placement="center"
          styles={{floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_data-5" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="ok" text="Please mark yourself as 'ready' once you are done." />}
          target=".user-menu button"
          placement="right"
          styles={{arrow: {length: 14, spread: 22, color: "#0057ff"}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_insights-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingModal image={<GenerateInsights />} title="Phase 3: Generate Insights" textContent={t("Onboarding.insightsWelcome")} />}
          placement="center"
          styles={{floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_insights-2" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingTooltip
              image={<StanIcon />}
              imgPosition="left"
              buttonType="ok"
              text="Please create a voting with 3 votes per participant to identify the most important topics!"
            />
          }
          target=".admin-menu"
          placement="left"
          styles={{arrow: {length: 14, spread: 22, color: "#ffaa5a"}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_insights-3" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="ok" text="Click here once you want to finish the voting!" />}
          target=".vote-display"
          placement="bottom"
          styles={{arrow: {length: 14, spread: 22, color: "#ea434b"}, floater: {zIndex: 10000}}}
        />
      )}
      {/* insights step 4 is for looking at the generated votes */}
      {phaseStep === "board_insights-5" && (
        <Floater
          open={stepOpen}
          component={<OnboardingChat chatName="Chat_Generate-Insights" title="Example: Generating Insights" />}
          placement="center"
          styles={{floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_actions-1" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingModal
              image={<img src={decideImg} alt="Stan with question-marks and exclamation-points" />}
              title="Phase 4: Decide what to do"
              textContent={t("Onboarding.decideWelcome")}
            />
          }
          placement="center"
          styles={{floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_actions-2" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingTooltip
              image={<StanIcon />}
              imgPosition="left"
              buttonType="ok"
              text="Please make the Actions-column visible now so that Mike can discuss the actions with the team."
            />
          }
          target=".board .column:last-of-type .column__header-title"
          placement="left"
          styles={{arrow: {length: 14, spread: 22, color: "#ffaa5a"}, floater: {zIndex: 10000}}}
        />
      )}
      {/* board_actions 3 and 4 are for spawning & looking at action-notes */}
      {phaseStep === "board_check_out-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingModal image={<img src={stanDrink} alt="Stan drinking" />} title="Phase 5: Close the Retrospective" textContent={t("Onboarding.checkOutWelcome")} />}
          placement="center"
          styles={{floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_out-2" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="next" text="To document your results, you can even export the board in the settings!" />
          }
          target=".user-menu .menu__items li:last-child"
          placement="right"
          styles={{arrow: {length: 14, spread: 22, color: "#0057ff"}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_out-3" && (
        <Floater open={stepOpen} component={<OnboardingChat chatName="Chat_Check-Out" title="Example: Check-Out" />} placement="center" styles={{floater: {zIndex: 10000}}} />
      )}
      {phaseStep === "outro-1" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingModal
              image={<MikeHappy />}
              title="Mike: Thank you for your help!"
              textContent="You were a great help during this retrospective! Thanks to you the retrospective was a success. I will do my best on my own in the next sessions!"
            />
          }
          placement="center"
          styles={{floater: {zIndex: 10000}}}
        />
      )}
    </div>
  );
};
