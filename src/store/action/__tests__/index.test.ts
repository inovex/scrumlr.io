import {UsersActionFactory} from "../users";
import {ActionFactory} from "../index";
import {NoteActionFactory} from "../note";
import {ColumnActionFactory} from "../column";
import {BoardActionFactory} from "../board";

describe("actions", () => {
  test("all board actions are listen in action factory", () => {
    Object.keys(BoardActionFactory).forEach((actionGenerator) => {
      expect(ActionFactory[actionGenerator]).not.toBeUndefined();
    });
  });

  test("all column actions are listen in action factory", () => {
    Object.keys(ColumnActionFactory).forEach((actionGenerator) => {
      expect(ActionFactory[actionGenerator]).not.toBeUndefined();
    });
  });

  test("all note actions are listen in action factory", () => {
    Object.keys(NoteActionFactory).forEach((actionGenerator) => {
      expect(ActionFactory[actionGenerator]).not.toBeUndefined();
    });
  });

  test("all users actions are listen in action factory", () => {
    Object.keys(UsersActionFactory).forEach((actionGenerator) => {
      expect(ActionFactory[actionGenerator]).not.toBeUndefined();
    });
  });
});
