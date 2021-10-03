import {UsersActionFactory, UsersActionType, UsersReduxAction} from "store/action/users";
import {ReduxAction} from "store/action";
import {EditUserConfigurationRequest, UserClientModel, UserServerModel} from "types/user";
import {AssertTypeEqual} from "testUtils";

describe("users actions", () => {
  test("equal number of action types and factory functions", () => {
    expect(Object.keys(UsersActionType).length).toEqual(Object.keys(UsersActionFactory).length);
  });

  describe("set users", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.setUsers>, UsersReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.setUsers>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const user: UserClientModel = {
        id: "id",
        displayName: "John Doe",
        admin: true,
        updatedAt: new Date("2020-11-30"),
        createdAt: new Date("2020-11-30"),
        online: false,
      };
      const action = UsersActionFactory.setUsers([user], true);

      expect(action).toEqual({
        type: "@@SCRUMLR/setUsers",
        users: [user],
        admin: true,
      });
    });
  });

  describe("set user status", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.setUserStatus>, UsersReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.setUserStatus>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const user: UserClientModel = {
        id: "id",
        displayName: "John Doe",
        admin: true,
        updatedAt: new Date("2020-11-30"),
        createdAt: new Date("2020-11-30"),
        online: false,
      };
      const action = UsersActionFactory.setUserStatus(user.id, true);

      expect(action).toEqual({
        type: "@@SCRUMLR/setUserStatus",
        userId: user.id,
        status: true,
      });
    });
  });

  describe("update user", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.updateUser>, UsersReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.updateUser>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const user: UserServerModel = {
        objectId: "id",
        displayName: "John Doe",
        updatedAt: new Date("2020-11-30"),
        createdAt: new Date("2020-11-30"),
      };
      const action = UsersActionFactory.updateUser(user);

      expect(action).toEqual({
        type: "@@SCRUMLR/updateUser",
        user,
      });
    });
  });

  describe("change permission", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.changePermission>, UsersReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.changePermission>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = UsersActionFactory.changePermission("id", false);

      expect(action).toEqual({
        type: "@@SCRUMLR/changePermission",
        userId: "id",
        moderator: false,
      });
    });
  });

  describe("edit user configuration", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.editUserConfiguration>, UsersReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof UsersActionFactory.editUserConfiguration>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const request: EditUserConfigurationRequest = {showHiddenColumns: true};
      const action = UsersActionFactory.editUserConfiguration(request);

      expect(action).toEqual({
        type: "@@SCRUMLR/editUserConfiguration",
        userConfigurationRequest: {
          showHiddenColumns: true,
        },
      });
    });
  });
});
