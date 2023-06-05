import {ApplicationState} from "../../types";

export default (overwrite?: Partial<ApplicationState>): ApplicationState => ({
  auth: {user: {id: "test-auth-user-id", name: "test-auth-user-name"}, initializationSucceeded: true},
  board: {
    status: "ready",
    data: {
      id: "test-board-id",
      name: "test-board-name",
      accessPolicy: "PUBLIC",
      showAuthors: true,
      showNotesOfOtherUsers: true,
      allowStacking: true,
    },
  },
  requests: [
    {
      user: {
        id: "test-requests-user-id-1",
        name: "test-requests-user-name-1",
      },
      status: "PENDING",
    },
  ],
  participants: {
    self: {
      user: {
        id: "test-participants-self-user-id",
        name: "test-participants-self-user-name",
      },
      connected: true,
      ready: false,
      raisedHand: false,
      showHiddenColumns: false,
      role: "OWNER",
    },
    others: [
      {
        user: {
          id: "test-participants-others-user-id-1",
          name: "test-participants-others-user-name-1",
        },
        connected: true,
        ready: false,
        raisedHand: false,
        showHiddenColumns: false,
        role: "MODERATOR",
      },
      {
        user: {
          id: "test-participants-others-user-id-2",
          name: "test-participants-others-user-name-2",
        },
        connected: false,
        ready: false,
        raisedHand: false,
        showHiddenColumns: false,
        role: "PARTICIPANT",
      },
    ],
    focusInitiator: null,
  },
  columns: [
    {
      id: "test-columns-id-1",
      name: "test-columns-name-1",
      color: "backlog-blue",
      visible: true,
      index: 0,
    },
    {
      id: "test-columns-id-2",
      name: "test-columns-name-2",
      color: "planning-pink",
      visible: true,
      index: 1,
    },
    {
      id: "test-columns-id-3",
      name: "test-columns-name-3",
      color: "planning-pink",
      visible: true,
      index: 2,
    },
  ],
  notes: [
    {
      id: "test-notes-id-1",
      author: "test-participants-others-user-id-1",
      text: "Lorem Ipsum",
      position: {
        column: "test-columns-id-1",
        rank: 0,
        stack: null,
      },
    },
    {
      id: "test-notes-id-2",
      author: "test-participants-others-user-id-1",
      text: "Lorem Ipsum",
      position: {
        column: "test-columns-id-1",
        rank: 1,
        stack: null,
      },
    },
    {
      id: "test-notes-id-3",
      author: "test-participants-others-user-id-1",
      text: "Lorem Ipsum",
      position: {
        column: "test-columns-id-2",
        rank: 0,
        stack: null,
      },
    },
  ],
  votes: [
    {
      voting: "test-votings-open-id-1",
      note: "test-notes-id-1",
    },
    {
      voting: "test-votings-past-id-1",
      note: "test-notes-id-2",
    },
  ],
  votings: {
    open: {
      id: "test-votings-open-id-1",
      voteLimit: 5,
      allowMultipleVotes: false,
      showVotesOfOthers: false,
      status: "OPEN",
    },
    past: [
      {
        id: "test-votings-past-id-1",
        voteLimit: 5,
        allowMultipleVotes: false,
        showVotesOfOthers: false,
        status: "CLOSED",
      },
    ],
  },
  view: {
    moderating: false,
    serverTimeOffset: 0,
    enabledAuthProvider: [],
    feedbackEnabled: false,
    hotkeysAreActive: true,
    noteFocused: false,
    hotkeyNotificationsEnabled: false,
  },
  onboarding: {
    phase: "none",
    step: 1,
    stepOpen: false,
  },
  onboardingNotes: [],
  assignments: [],
  ...overwrite,
});
