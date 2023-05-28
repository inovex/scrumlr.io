export type OnboardingPhase = "none" | "newBoard" | "board_configure_template" |
 "board_check_in" | "board_write_note" | "board_stack_note" | "board_voting_timer" | "board_present" | "board_export";

export interface OnboardingState {
  phase: OnboardingPhase;
  step: number;
}
