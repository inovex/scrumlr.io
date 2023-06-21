import {Action, ReduxAction} from "store/action";
import {OnboardingColumn, OnboardingPhase, OnboardingState} from "types/onboarding";

interface OnboardingPhaseSteps {
  name: OnboardingPhase;
  steps: number;
}

export const phaseSteps: OnboardingPhaseSteps[] = [
  {name: "none", steps: 0},
  {name: "intro", steps: 2},
  {name: "newBoard", steps: 3},
  {name: "board_check_in", steps: 1},
  {name: "board_data", steps: 6},
  {name: "board_insights", steps: 1},
  {name: "board_actions", steps: 3},
  {name: "board_check_out", steps: 2},
  {name: "outro", steps: 2},
];

const initialState: OnboardingState = {
  phase: phaseSteps.find((p) => (sessionStorage.getItem("onboarding_phase") as OnboardingPhase)?.includes(p.name))?.name ?? "none",
  step: JSON.parse(sessionStorage.getItem("onboarding_step") ?? "1"),
  stepOpen: JSON.parse(sessionStorage.getItem("onboarding_stepOpen") ?? "true"),
  onboardingColumns: JSON.parse(sessionStorage.getItem("onboarding_columns") ?? "[]"),
  inUserTask: JSON.parse(sessionStorage.getItem("onboarding_inUserTask") ?? "false"),
  fakeVotesOpen: JSON.parse(sessionStorage.getItem("onboarding_fakeVotesOpen") ?? "false"),
};

export const onboardingReducer = (state: OnboardingState = initialState, action: ReduxAction): OnboardingState => {
  switch (action.type) {
    case Action.ChangePhase: {
      return {
        ...state,
        phase: action.phase,
        step: 1,
        stepOpen: true,
        inUserTask: false,
      };
    }
    case Action.IncrementStep: {
      const currentPhaseIndex = phaseSteps.findIndex((p) => p.name === state.phase);
      const increment = action.amount ?? 1;
      if (state.step + increment > phaseSteps[currentPhaseIndex].steps) {
        return {
          ...state,
          phase: phaseSteps[currentPhaseIndex + 1].name,
          step: 1,
          stepOpen: true,
          inUserTask: false,
        };
      }
      return {
        ...state,
        step: state.step + increment,
        stepOpen: true,
      };
    }
    case Action.ToggleStepOpen: {
      return {
        ...state,
        stepOpen: !state.stepOpen,
      };
    }
    case Action.RegisterOnboardingColumns: {
      if (state.phase === "board_check_in" && state.step === 1) {
        const newOnboardingColumns: OnboardingColumn[] = [];
        action.columns.forEach((c) => {
          newOnboardingColumns.push({id: c.id, name: c.name});
        });
        return {
          ...state,
          onboardingColumns: newOnboardingColumns,
        };
      }
      return state;
    }
    case Action.ClearOnboardingColumns: {
      return {
        ...state,
        onboardingColumns: [],
      };
      break;
    }
    case Action.SetInUserTask: {
      return {
        ...state,
        inUserTask: action.inTask,
      };
    }
    case Action.SetFakeVotesOpen: {
      return {
        ...state,
        fakeVotesOpen: action.fakesOpen,
      };
    }
    default:
      return state;
  }
};
