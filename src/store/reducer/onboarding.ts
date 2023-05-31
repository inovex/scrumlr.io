import {Action, ReduxAction} from "store/action";
import { OnboardingColumn, OnboardingPhase, OnboardingState } from "types/onboarding";

const initialState: OnboardingState = {
  phase: "none",
  step: 1,
  stepOpen: true,
  columns: [],
  notes: []
}

interface OnboardingPhaseSteps {
  name: OnboardingPhase,
  steps: number
}

const phaseSteps: OnboardingPhaseSteps[] = [
  { name: "none", steps: 0 },
  { name: "newBoard", steps: 1},
  { name: "board_configure_template", steps: 3},
  { name: "board_check_in", steps: 1},
  { name: "board_note", steps: 2},
  { name: "board_voting_timer", steps: 1},
  { name: "board_present", steps: 1},
  { name: "board_export", steps: 1},
]

export const onboardingReducer = (state: OnboardingState = initialState, action: ReduxAction ): OnboardingState => {
  switch (action.type) {
    case Action.ChangePhase: {
      return {
        ...state,
        phase: action.phase,
        step: 1,
        stepOpen: true
      };
    }
    case Action.IncrementStep: {
      const currentPhaseIndex = phaseSteps.findIndex((p) => p.name === state.phase);
      if (phaseSteps[currentPhaseIndex].steps === state.step) {
        return {
          ...state,
          phase: phaseSteps[currentPhaseIndex + 1].name,
          step: 1,
          stepOpen: true
        };
      }
      return {
          ...state,
          step: state.step + 1,
          stepOpen: true
        };

    }
    case Action.AddOnboardingColumn: {
      const newColumns: OnboardingColumn[] = [...state.columns];
      newColumns.push({id: action.columnId, title: action.title});
      return {
        ...state,
        columns: newColumns
      };
    }
    case Action.ToggleStepOpen: {
      return {
        ...state,
        stepOpen: !state.stepOpen
      };
    }
    default:
      return state;
  }
}
