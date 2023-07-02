export type OnboardingPhase = "none" | "newBoard" | "board_column" | "board_users" | "board_participant" | "board_moderator" | "board_outro";

export interface OnboardingNote {
  columnId: string;
  author: string;
}

export interface OnboardingColumn {
  id: string;
  name: string;
}

export interface OnboardingState {
  phase: OnboardingPhase;
  step: number;
  stepOpen: boolean;
  onboardingColumns: OnboardingColumn[];
  inUserTask: boolean;
  fakeVotesOpen: boolean;
  spawnedBoardNotes: boolean;
  spawnedActionNotes: boolean;
}
