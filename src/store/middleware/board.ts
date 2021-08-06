import {Dispatch, MiddlewareAPI, AnyAction} from "redux";
import {ApplicationState} from "types/store";
import Parse from "parse";
import {mapUserServerToClientModel, UserServerModel} from "types/user";
import {mapNoteServerToClientModel, NoteServerModel} from "types/note";
import {BoardServerModel, mapBoardServerToClientModel} from "types/board";
import {JoinRequestServerModel, mapJoinRequestServerToClientModel} from "types/joinRequest";
import {ActionFactory, ActionType, ReduxAction} from "store/action";
import {API} from "api";

let closeSubscriptions: (() => void)[] = [];

export const passBoardMiddleware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ActionType.LeaveBoard) {
    closeSubscriptions.forEach((closeCallback) => closeCallback());
    closeSubscriptions = [];
  }

  if (action.type === ActionType.PermittedBoardAccess) {
    const currentUser = Parse.User.current()!;

    const isOnline = (user: Parse.User, boardId: string) => (user.get("boards") as string[])?.indexOf(boardId) >= 0;

    const goOnline = (boardId: string) => {
      currentUser.add("boards", boardId);
      currentUser.save();
    };

    const createJoinRequestSubscription = () => {
      const joinRequestQuery = new Parse.Query("JoinRequest");
      joinRequestQuery.include("user.displayName");
      joinRequestQuery.equalTo("board", Parse.Object.extend("Board").createWithoutData(action.boardId));

      joinRequestQuery.subscribe().then((subscription) => {
        closeSubscriptions.push(() => {
          subscription.unsubscribe();
        });

        subscription.on("open", () => {
          joinRequestQuery.find().then((results) => {
            dispatch(ActionFactory.initializeJoinRequests((results as JoinRequestServerModel[]).map(mapJoinRequestServerToClientModel)));
          });
        });

        subscription.on("create", async (object) => {
          // Since LiveQueries do not support .include(..), we have to fetch the user data manually
          await (object.get("user") as Parse.User).fetch();
          dispatch(ActionFactory.createJoinRequest(mapJoinRequestServerToClientModel(object as JoinRequestServerModel)));
        });

        subscription.on("update", async (object) => {
          // Since LiveQueries do not support .include(..), we have to fetch the user data manually
          await (object.get("user") as Parse.User).fetch();
          dispatch(ActionFactory.updateJoinRequest(mapJoinRequestServerToClientModel(object as JoinRequestServerModel)));
        });
      });
    };

    const createUsersSubscription = () => {
      const adminsQuery = new Parse.Query(Parse.Role);
      adminsQuery.equalTo("name", `admin_of_${action.boardId}`);
      const memberQuery = new Parse.Query(Parse.Role);
      memberQuery.equalTo("name", `member_of_${action.boardId}`);

      const usersQuery = Parse.Query.or(adminsQuery, memberQuery);
      usersQuery.subscribe().then((subscription) => {
        closeSubscriptions.push(() => {
          subscription.unsubscribe();
        });

        const updateUsers = (role: Parse.Role) => {
          if (role.getName() === `member_of_${action.boardId}`) {
            role
              .getUsers()
              .query()
              .find()
              .then((users) => {
                dispatch(
                  ActionFactory.setUsers(
                    users.map((user) =>
                      mapUserServerToClientModel(user.toJSON() as unknown as UserServerModel, {
                        admin: false,
                        online: isOnline(user, action.boardId),
                      })
                    ),
                    false
                  )
                );
              });
          }
          if (role.getName() === `admin_of_${action.boardId}`) {
            role
              .getUsers()
              .query()
              .find()
              .then((users) => {
                dispatch(
                  ActionFactory.setUsers(
                    users.map((user) =>
                      mapUserServerToClientModel(user.toJSON() as unknown as UserServerModel, {
                        admin: true,
                        online: isOnline(user, action.boardId),
                      })
                    ),
                    true
                  )
                );
              });
          }
        };

        subscription.on("update", (object) => {
          updateUsers(object as Parse.Role);
        });

        subscription.on("open", () => {
          usersQuery.find().then((results) => {
            for (let i = 0; i < results.length; i += 1) {
              updateUsers(results[i] as Parse.Role);
            }
          });
        });
      });

      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo("boards", action.boardId);
      userQuery.subscribe().then((subscription) => {
        closeSubscriptions.push(() => {
          subscription.unsubscribe();
        });

        subscription.on("enter", (object) => {
          dispatch(ActionFactory.setUserStatus(object.id, true));
        });

        subscription.on("leave", (object) => {
          dispatch(ActionFactory.setUserStatus(object.id, false));
        });
      });
    };

    const createNoteSubscription = () => {
      const noteQuery = new Parse.Query("Note");
      noteQuery.equalTo("board", Parse.Object.extend("Board").createWithoutData(action.boardId));
      noteQuery.subscribe().then((subscription) => {
        closeSubscriptions.push(() => {
          subscription.unsubscribe();
        });
        subscription.on("create", (object) => {
          dispatch(ActionFactory.createdNote(mapNoteServerToClientModel(object as NoteServerModel)));
        });
        subscription.on("update", (object) => {
          dispatch(ActionFactory.updatedNote(mapNoteServerToClientModel(object as NoteServerModel)));
        });
        subscription.on("delete", (object) => {
          dispatch(ActionFactory.deleteNote(object.id));
        });
        subscription.on("open", () => {
          noteQuery.find().then((results) => {
            dispatch(ActionFactory.initializeNotes((results as unknown as NoteServerModel[]).map(mapNoteServerToClientModel)));
          });
        });
      });
    };

    const boardQuery = new Parse.Query("Board");
    boardQuery.equalTo("objectId", action.boardId);
    boardQuery.subscribe().then((subscription) => {
      closeSubscriptions.push(() => {
        subscription.unsubscribe();
      });

      subscription.on("update", (object) => {
        dispatch(ActionFactory.updatedBoard(mapBoardServerToClientModel(object.toJSON() as unknown as BoardServerModel)));
      });

      subscription.on("delete", () => {
        dispatch(ActionFactory.deleteBoard());
      });

      let connectionsCount = 0;
      subscription.on("open", () => {
        connectionsCount += 1;

        if (connectionsCount === 1) {
          // first connect to the board
          createJoinRequestSubscription();
          createNoteSubscription();
          createUsersSubscription();

          boardQuery.first().then((board) => {
            dispatch(ActionFactory.initializeBoard(mapBoardServerToClientModel(board?.toJSON() as unknown as BoardServerModel)));
          });
        } else {
          // reconnect
          boardQuery.first().then((board) => {
            if (!isOnline(currentUser, board!.id)) {
              goOnline(board!.id);
            }
          });
        }
      });
    });
  }

  if (action.type === ActionType.EditBoard) {
    API.editBoard(action.board);
  }
};
