import {Column} from "types/column";
import {OnboardingPhase} from "types/onboarding";

export const OnboardingAction = {
  ChangePhase: "scrumlr.io/changePhase" as const,
  IncrementStep: "scrumlr.io/incrementStep" as const,
  ToggleStepOpen: "scrumlr.io/toggleStepOpen" as const,
  RegisterOnboardingColumns: "scrumlr.io/registerOnboardingColumns" as const,
  ClearOnboardingColumns: "scrumlr.io/clearOnboardingColumns" as const,
  SetInUserTask: "scrumlr.io/setInUserTask" as const,
  SetFakeVotesOpen: "scrumlr.io/setFakeVotesOpen" as const,
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
  clearOnboardingColumns: () => ({
    type: OnboardingAction.ClearOnboardingColumns,
  }),
  setInUserTask: (inTask: boolean) => ({
    type: OnboardingAction.SetInUserTask,
    inTask,
  }),
  setFakeVotesOpen: (fakesOpen: boolean) => ({
    type: OnboardingAction.SetFakeVotesOpen,
    fakesOpen,
  }),
};

export type OnboardingReduxAction =
  | ReturnType<typeof OnboardingActionFactory.changePhase>
  | ReturnType<typeof OnboardingActionFactory.incrementStep>
  | ReturnType<typeof OnboardingActionFactory.toggleStepOpen>
  | ReturnType<typeof OnboardingActionFactory.registerOnboardingColumns>
  | ReturnType<typeof OnboardingActionFactory.clearOnboardingColumns>
  | ReturnType<typeof OnboardingActionFactory.setInUserTask>
  | ReturnType<typeof OnboardingActionFactory.setFakeVotesOpen>;
