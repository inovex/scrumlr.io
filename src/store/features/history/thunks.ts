import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {HistoryBoard} from "./types";

// mock data. TODO: remove once the real GET /boards endpoint (BoardOverview) is available.
const TEST_HISTORY_BOARDS: HistoryBoard[] = [
  {
    id: "1",
    name: "Test Board 1",
    description: "This is a test board",
    accessPolicy: "PUBLIC",
    columns: [
      {id: "col-1-1", name: "Lean Coffee", description: "", color: "backlog-blue", visible: true, index: 0},
      {id: "col-1-2", name: "Actions", description: "", color: "poker-purple", visible: true, index: 1},
    ],
    participants: 3,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    modifiedAt: new Date("2026-01-01T01:00:00.000Z"),
    notes: 42,
    isLocked: true,
    userRole: "OWNER",
    favourite: true,
  },
  {
    id: "2",
    name: "Test Board 2",
    description:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua." +
      " At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. " +
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
      "At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
    accessPolicy: "BY_PASSPHRASE",
    columns: [
      {id: "col-2-1", name: "Start", description: "", color: "goal-green", visible: true, index: 0},
      {id: "col-2-2", name: "Stop", description: "", color: "online-orange", visible: true, index: 1},
      {id: "col-2-3", name: "Continue", description: "", color: "backlog-blue", visible: true, index: 2},
      {id: "col-2-4", name: "Actions", description: "", color: "planning-pink", visible: true, index: 3},
    ],
    participants: 12,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    modifiedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 1),
    notes: 5,
    isLocked: false,
    userRole: "PARTICIPANT",
    favourite: false,
  },
  {
    id: "3",
    name: "Sprint 42 Retro",
    description: "Retrospective for sprint 42 — moderator view",
    accessPolicy: "BY_INVITE",
    columns: [
      {id: "col-3-1", name: "Ball", description: "", color: "online-orange", visible: true, index: 0},
      {id: "col-3-2", name: "Tall", description: "", color: "value-violet", visible: true, index: 1},
      {id: "col-3-3", name: "Fall", description: "", color: "goal-green", visible: true, index: 2},
    ],
    participants: 6,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    modifiedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 2),
    notes: 18,
    isLocked: false,
    userRole: "MODERATOR",
    favourite: false,
  },
];

export const getBoards = createAsyncThunk<HistoryBoard[], void, {state: ApplicationState}>("history/getBoards", async () => {
  // TODO: replace with `return API.getBoards();` (GET /boards) once the endpoint is merged.
  return TEST_HISTORY_BOARDS;
});
