import {AddColumnRequest} from "types/column";
import {AssertTypeEqual} from "../../../testUtils";
import {ColumnActionFactory, ColumnActionType, ColumnReduxAction} from "../column";
import {ReduxAction} from "../index";

describe("column actions", () => {
  test("equal number of action types and factory functions", () => {
    expect(Object.keys(ColumnActionType).length).toEqual(Object.keys(ColumnActionFactory).length);
  });

  describe("add column", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof ColumnActionFactory.addColumn>, ColumnReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof ColumnActionFactory.addColumn>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = ColumnActionFactory.addColumn({name: "Name", color: "planning-pink", hidden: false});
      expect(action).toEqual({
        column: {
          color: "planning-pink",
          hidden: false,
          name: "Name",
        } as AddColumnRequest,
        type: "@@SCRUMLR/addColumn",
      });
    });
  });

  describe("edit column", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof ColumnActionFactory.editColumn>, ColumnReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof ColumnActionFactory.editColumn>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = ColumnActionFactory.editColumn({columnId: "columnId", name: "New name"});
      expect(action).toEqual({
        type: "@@SCRUMLR/editColumn",
        column: {
          columnId: "columnId",
          name: "New name",
        },
      });
    });
  });

  describe("delete column", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof ColumnActionFactory.deleteColumn>, ColumnReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof ColumnActionFactory.deleteColumn>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = ColumnActionFactory.deleteColumn("columnId");
      expect(action).toEqual({
        type: "@@SCRUMLR/deleteColumn",
        columnId: "columnId",
      });
    });
  });
});
