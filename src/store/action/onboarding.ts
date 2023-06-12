import {Column} from "types/column";
import {OnboardingPhase} from "types/onboarding";

export const OnboardingAction = {
  ChangePhase: "scrumlr.io/changePhase" as const,
  IncrementStep: "scrumlr.io/incrementStep" as const,
  ToggleStepOpen: "scrumlr.io/toggleStepOpen" as const,
  RegisterOnboardingColumns: "scrumlr.io/registerOnboardingColumns" as const,
  SetInUserTask: "scrumlr.io/setInUserTask" as const,
};

export const OnboardingActionFactory = {
  changePhase: (phase: OnboardingPhase) => ({
    type: OnboardingAction.ChangePhase,
    phase,
  }),
  incrementStep: (amount?: number) => ({
    type: OnboardingAction.IncrementStep,
    amount,
  }),
  toggleStepOpen: () => ({
    type: OnboardingAction.ToggleStepOpen,
  }),
  registerOnboardingColumns: (columns: Column[]) => ({
    type: OnboardingAction.RegisterOnboardingColumns,
    columns,
  }),
  setInUserTask: (inTask: boolean) => ({
    type: OnboardingAction.SetInUserTask,
    inTask,
  }),
};

export type OnboardingReduxAction =
  | ReturnType<typeof OnboardingActionFactory.changePhase>
  | ReturnType<typeof OnboardingActionFactory.incrementStep>
  | ReturnType<typeof OnboardingActionFactory.toggleStepOpen>
  | ReturnType<typeof OnboardingActionFactory.registerOnboardingColumns>
  | ReturnType<typeof OnboardingActionFactory.setInUserTask>;
