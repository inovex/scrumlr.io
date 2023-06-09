import {Action, ReduxAction} from "store/action";
import {OnboardingColumn, OnboardingPhase, OnboardingState} from "types/onboarding";

const initialState: OnboardingState = {
  phase: JSON.parse(sessionStorage.getItem("onboarding_phase") ?? "none"),
  step: JSON.parse(sessionStorage.getItem("onboarding_step") ?? "1"),
  stepOpen: JSON.parse(sessionStorage.getItem("onboarding_stepOpen") ?? "true"),
  onboardingColumns: JSON.parse(sessionStorage.getItem("onboarding_columns") ?? "[]"),
};

interface OnboardingPhaseSteps {
  name: OnboardingPhase;
  steps: number;
}

export const phaseSteps: OnboardingPhaseSteps[] = [
  {name: "none", steps: 0},
  {name: "intro", steps: 3},
  {name: "newBoard", steps: 3},
  {name: "board_check_in", steps: 5},
  {name: "board_data", steps: 5},
  {name: "board_insights", steps: 1},
  {name: "board_actions", steps: 3},
  {name: "board_check_out", steps: 2},
  {name: "outro", steps: 2},
];

export const onboardingReducer = (state: OnboardingState = initialState, action: ReduxAction): OnboardingState => {
  switch (action.type) {
    case Action.ChangePhase: {
      return {
        ...state,
        phase: action.phase,
        step: 1,
        stepOpen: true,
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
    default:
      return state;
  }
};
