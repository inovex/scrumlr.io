import {ApplicationState} from "store";

export default (overwrite?: Partial<ApplicationState>): ApplicationState => ({
  auth: {user: {id: "test-auth-user-id", name: "test-auth-user-name", isAnonymous: true}, initializationSucceeded: true},
  board: {
    status: "ready",
    data: {
      id: "test-board-id",
      name: "test-board-name",
      accessPolicy: "PUBLIC",
      showAuthors: true,
      showNotesOfOtherUsers: true,
      showNoteReactions: true,
      allowStacking: true,
      isLocked: true,
    },
  },
  requests: [
    {
      user: {
        id: "test-requests-user-id-1",
        name: "test-requests-user-name-1",
        isAnonymous: true,
      },
      status: "PENDING",
    },
  ],
  participants: {
    self: {
      user: {
        id: "test-participants-self-user-id",
        name: "test-participants-self-user-name",
        isAnonymous: true,
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
          isAnonymous: true,
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
          isAnonymous: true,
        },
        connected: false,
        ready: false,
        raisedHand: false,
        showHiddenColumns: false,
        role: "PARTICIPANT",
      },
    ],
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
        stack: null,
        column: "test-columns-id-1",
        rank: 0,
      },
      edited: true,
    },
    {
      id: "test-notes-id-2",
      author: "test-participants-others-user-id-1",
      text: "Lorem Ipsum",
      position: {
        stack: null,
        column: "test-columns-id-1",
        rank: 1,
      },
      edited: false,
    },
    {
      id: "test-notes-id-3",
      author: "test-participants-others-user-id-1",
      text: "Lorem Ipsum",
      position: {
        stack: null,
        column: "test-columns-id-2",
        rank: 0,
      },
      edited: false,
    },
  ],
  reactions: [
    {
      id: "test-reactions-id-1",
      note: "test-notes-id-1",
      user: "test-participants-self-user-id",
      reactionType: "like",
    },
    {
      id: "test-reactions-id-2",
      note: "test-notes-id-2",
      user: "test-participants-self-user-id",
      reactionType: "like",
    },
    {
      id: "test-reactions-id-3",
      note: "test-notes-id-1",
      user: "test-participants-self-user-id",
      reactionType: "heart",
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
      isAnonymous: true,
    },
    past: [
      {
        id: "test-votings-past-id-1",
        voteLimit: 5,
        allowMultipleVotes: false,
        showVotesOfOthers: false,
        status: "CLOSED",
        isAnonymous: true,
      },
    ],
  },
  view: {
    theme: "auto",
    hotkeyNotificationsEnabled: true,
    moderating: false,
    serverTimeOffset: 0,
    anonymousLoginDisabled: false,
    enabledAuthProvider: [],
    feedbackEnabled: false,
    hotkeysAreActive: true,
    noteFocused: false,
    showBoardReactions: true,
    snowfallEnabled: false,
    snowfallNotificationEnabled: false,
  },
  boardReactions: [],
  skinTone: {
    name: "default",
    component: "",
  },
  ...overwrite,
});
