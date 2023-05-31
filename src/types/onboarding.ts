export type OnboardingPhase = "none" | "newBoard" | "board_configure_template" |
 "board_check_in" | "board_note" | "board_voting_timer" | "board_present" | "board_export";

export interface OnboardingNote {
  columnId: string,
  author: string
}

export interface OnboardingColumn {
  id: string,
  title: string
}

export interface OnboardingState {
  phase: OnboardingPhase;
  step: number;
  stepOpen: boolean;
  columns: OnboardingColumn[];
  notes: OnboardingNote[]
}
