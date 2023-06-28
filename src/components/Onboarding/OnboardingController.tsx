import {useAppSelector} from "store";
import {isEqual} from "underscore";
import Floater from "react-floater";
import {ReactComponent as StanIcon} from "assets/stan/Stan_ellipse_logo.svg";
import {ReactComponent as GatheringDataImg} from "assets/onboarding/Gathering-Data-Image.svg";
import stanDrink from "assets/stan/Slooth_3_drink (2)@4x.png";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {useEffect} from "react";
import checkInImg from "assets/onboarding/check-in_image_temp.jpg";
import {ReactComponent as StanOk} from "assets/stan/Stan_Ok.svg";
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
    switch (phaseStep) {
      /* phase "intro" handles itself - phase "none" has no onboarding activities */
      case "newBoard-1":
        break;
      case "newBoard-2":
        break;
      case "board_check_in-1": // welcome
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
      case "board_data-5":
        dispatch(Actions.setInUserTask(true));
        if (participants?.self.ready) {
          dispatch(Actions.setInUserTask(false));
          // dispatch(Actions.incrementStep());
        }
        break;
      case "board_insights-1":
        // dispatch(Actions.setFakeVotesOpen(true));
        break;
      case "board_insights-2":
        dispatch(Actions.setInUserTask(true));
        break;
      case "board_insights-4":
        dispatch(Actions.setFakeVotesOpen(true));
        break;
      case "board_actions-1":
        break;
      case "board_actions-2":
        break;
      case "board_actions-3":
        spawnNotes("Actions");
        dispatch(Actions.incrementStep());
        break;
      case "board-actions-4":
        break;
      case "board_check_out":
        break;
      case "outro":
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
            className="onboarding-button onboarding-skip-button"
            aria-label="Skip this step"
            onClick={() => {
              dispatch(Actions.incrementStep());
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

      {phaseStep === "newBoard-1" && (
        <Floater open={stepOpen} component={<OnboardingModalRetro />} placement="center" styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}} />
      )}
      {phaseStep === "newBoard-2" && (
        <Floater
          open={stepOpen}
          component={<OnboardingModal textContent={t("Onboarding.newBoardWelcome")} title="Preparation is Key!" hasNextButton image={<StanOk />} />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "newBoard-3" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text={t("Onboarding.newBoardSettings")} />}
          target=".new-board__extended:last-child"
          placement="right-end"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "newBoard-4" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="ok" text={t("Onboarding.newBoardCreate")} />}
          target=".new-board"
          placement="right"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_in-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingModal textContent={t("Onboarding.checkInWelcome")} title="Phase 1: Set the Stage" image={<img src={checkInImg} alt="check-in hero-img" />} />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_in-2" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text="I already invited Mike's team to the board!" />}
          placement="bottom-end"
          target=".share-button"
          styles={{arrow: {length: 14, spread: 18}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_in-3" && (
        <Floater
          open={stepOpen}
          component={<OnboardingChat chatName="Chat_Check-In" title="Mike's Check-In: Song Title" />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {/* board_check_in-4 and board_check_in-5 just handle spawning notes */}
      {phaseStep === "board_data-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingModal textContent={t("Onboarding.gatherDataWelcome")} title="Phase 2: Gather Data/Topics" image={<GatheringDataImg />} />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {/* board_data-2 and board_data-3 just handle spawning notes */}
      {phaseStep === "board_data-4" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="next" text={t("Onboarding.dataCardsAdded")} />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_data-5" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="ok" text="Please mark yourself as 'ready' once you are done." />}
          target=".user-menu button"
          placement="right"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_insights-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingModal image={<StanIcon />} title="Phase 3: Generate Insights" textContent={t("Onboarding.insightsWelcome")} />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
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
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_insights-3" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="ok" text="Click here once you want to finish the voting!" />}
          target=".vote-display"
          placement="bottom"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {/* insights step 4 is for looking at the generated votes */}
      {phaseStep === "board_insights-5" && (
        <Floater
          open={stepOpen}
          component={<OnboardingChat chatName="Chat_Generate-Insights" title="Example: Generating Insights" />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_actions-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingModal image={<StanIcon />} title="Phase 4: Decide what to do" textContent={t("Onboarding.decideWelcome")} />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
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
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_out-1" && (
        <Floater
          open={stepOpen}
          component={<OnboardingModal image={<img src={stanDrink} alt="Stan drinking" />} title="Phase 5: Close the Retrospective" textContent={t("Onboarding.checkOutWelcome")} />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_out-2" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="ok" text="To document your results, you can even export the board in the settings!" />}
          target=".user-menu .menu__items li:last-child"
          placement="right"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
    </div>
  );
};
