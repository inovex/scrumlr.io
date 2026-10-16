type AccessPolicy = "PUBLIC" | "BY_PASSPHRASE" | "BY_INVITE"

type Color = |
  "backlog-blue" |
  "goal-green" |
  "value-violet" |
  "online-orange" |
  "planning-pink" |
  "poker-purple" |
  "yielding-yellow"

type Role = "OWNER" | "MODERATOR" | "PARTICIPANT"

interface Column {
  name: string,
  description?: string | undefined,
  index: number,
  color: Color,
  visible: boolean,
};

export interface CreateBoardRequest {
  name: string,
  description?: string | undefined,
  accessPolicy: AccessPolicy,
  columns: Column[],
  passphrase?: string | undefined,
};

export interface JoinRequest {
  passphrase?: string | undefined
}

export interface UpdateUserSessionRequest {
  banned?: boolean | undefined,
  favourite?: boolean | undefined,
  raisedHand?: boolean | undefined,
  ready?: boolean | undefined,
  role?: Role,
  showHiddenColumns?: boolean | undefined,
}

export interface CreateTimerRequest {
  minutes: number
}

export interface CreateVotingRequest {
  allowMultipleVotes: boolean,
  isAnonymous: boolean,
  showVotesOfOthers: boolean,
  voteLimit: number,
}
