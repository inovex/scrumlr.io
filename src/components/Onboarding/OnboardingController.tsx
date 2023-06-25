import {useAppSelector} from "store";
import {isEqual} from "underscore";
import Floater from "react-floater";
import {ReactComponent as StanIcon} from "assets/stan/Stan_ellipse_logo.svg";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {useEffect} from "react";
import gatherDataImg from "assets/onboarding/As-introduction-to-Data-collection-in-marketing-research.jpg";
import checkInImg from "assets/onboarding/check-in_image_temp.jpg";
import stanOk from "assets/stan/Stan_Ok.svg";
import {onboardingAuthors} from "types/onboardingNotes";
import onboardingNotes from "./onboardingNotes.en.json";
import "./Onboarding.scss";
import {OnboardingModal} from "./Floaters/OnboardingModal";
import {OnboardingChat} from "./Floaters/OnboardingChat";
import {OnboardingTooltip} from "./Floaters/OnboardingTooltip";

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
      case "board_insights-1":
        // dispatch(Actions.setFakeVotesOpen(true));
        break;
      case "board_insights-2":
        dispatch(Actions.setInUserTask(true));
        break;
      case "board_insights-3":
        break;
      case "board_actions-1":
        break;
      case "board_actions-2":
        break;
      case "board_actions-3":
        break;
      case "board_check_out":
        break;
      case "outro":
        break;
      default:
        break;
    }
  }, [phaseStep, columns, dispatch, onboardingColumns]);

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
        <Floater
          open={stepOpen}
          component={
            <OnboardingModal textContent={t("Onboarding.newBoardWelcome")} title="Preparation is Key!" hasNextButton image={<img src={stanOk} alt="new board hero-img" />} />
          }
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "newBoard-2" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text={t("Onboarding.newBoardSettings")} />}
          target=".new-board__extended:last-child"
          placement="right-end"
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
          component={<OnboardingTooltip imgPosition="left" image={<StanIcon />} buttonType="next" text="I already invited the Mike's team to the board!" />}
          placement="bottom-end"
          target=".share-button"
          styles={{arrow: {length: 14, spread: 18}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_check_in-3" && (
        <Floater
          open={stepOpen}
          component={<OnboardingChat chatName="Chat_Check-In" title="Mikes' Check-In: Song Title" />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {/* board_check_in-4 and board_check_in-5 just handle spawning notes */}
      {phaseStep === "board_data-1" && (
        <Floater
          open={stepOpen}
          component={
            <OnboardingModal textContent={t("Onboarding.gatherDataWelcome")} title="Phase 2: Gather Data/Topics" image={<img src={gatherDataImg} alt="gather data hero-img" />} />
          }
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
          component={<OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="next" text={t("Onboarding.dataStacks")} />}
          target=".column"
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
          component={<OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="ok" text="Please create a voting with 3 votes per participant!" />}
          target=".admin-menu"
          placement="left"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
      {phaseStep === "board_insights-3" && (
        <Floater
          open={stepOpen}
          component={<OnboardingTooltip image={<StanIcon />} imgPosition="left" buttonType="next" text="there should be votes now yay" />}
          placement="center"
          styles={{arrow: {length: 14, spread: 22}, floater: {zIndex: 10000}}}
        />
      )}
    </div>
  );
};
