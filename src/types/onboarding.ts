export type OnboardingPhase = "none" | "intro" | "outro" | "newBoard" | "board_check_in" | "board_data" | "board_insights" | "board_actions" | "board_check_out";

export interface OnboardingNote {
  columnId: string;
  author: string;
}

export interface OnboardingColumn {
  id: string;
  title: string;
}

export interface OnboardingState {
  phase: OnboardingPhase;
  step: number;
  stepOpen: boolean;
}
