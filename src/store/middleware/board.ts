import {Dispatch, MiddlewareAPI, AnyAction} from "redux";
import {ApplicationState} from "types/store";
import Parse from "parse";
import {mapUserServerToClientModel, UserServerModel} from "types/user";
import {mapNoteServerToClientModel, NoteServerModel} from "types/note";
import {mapVoteServerToClientModel, VoteServerModel} from "types/vote";
import {BoardServerModel, mapBoardServerToClientModel} from "types/board";
import {JoinRequestServerModel, mapJoinRequestServerToClientModel} from "types/joinRequest";
import {ActionFactory, ActionType, ReduxAction} from "store/action";
import {API} from "api";
import {callAPI} from "api/callApi";

let closeSubscriptions: (() => void)[] = [];

export const passBoardMiddleware = async (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
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
            dispatch(ActionFactory.initializeNotes((results as NoteServerModel[]).map(mapNoteServerToClientModel)));
          });
        });
      });
    };

    const createVoteSubscription = () => {
      const voteQuery = new Parse.Query("Vote");
      voteQuery.equalTo("board", Parse.Object.extend("Board").createWithoutData(action.boardId));
      voteQuery.subscribe().then((subscription) => {
        closeSubscriptions.push(() => {
          subscription.unsubscribe();
        });
        subscription.on("create", (object) => {
          dispatch(ActionFactory.createdVote(mapVoteServerToClientModel(object as VoteServerModel)));
        });
        subscription.on("delete", (object) => {
          dispatch(ActionFactory.deletedVote(object.id));
        });
        // subscription.on("delete", () => {});
        subscription.on("open", () => {
          voteQuery.find().then((results) => {
            dispatch(ActionFactory.initializeVotes((results as VoteServerModel[]).map(mapVoteServerToClientModel)));
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

      subscription.on("update", async (object) => {
        let timerUTCEndTime;
        const board = object.toJSON() as unknown as BoardServerModel;
        if (board.timerUTCEndTime != null) {
          const serverTime: string = await callAPI("getServerTime", {});
          const serverTimeInMilliseconds = Date.parse(serverTime);
          const browserTimeInMilliseconds = Date.parse(new Date().toString());
          const differenceInMilliseconds = browserTimeInMilliseconds - serverTimeInMilliseconds;
          // difference > 0: Browserzeit ist vor der Serverzeit
          // difference < 0: Browserzeit ist hinter der Serverzeit
          // @ts-ignore
          const boardTimer = new Date(board.timerUTCEndTime.iso);
          timerUTCEndTime = new Date(boardTimer.getTime() + differenceInMilliseconds);
        }

        dispatch(ActionFactory.updatedBoard(mapBoardServerToClientModel({...(object.toJSON() as unknown as BoardServerModel), timerUTCEndTime})));
      });

      subscription.on("delete", (object) => {
        dispatch(ActionFactory.deleteBoard(object.id));
      });

      let connectionsCount = 0;
      subscription.on("open", () => {
        connectionsCount += 1;

        if (connectionsCount === 1) {
          // first connect to the board
          createJoinRequestSubscription();
          createNoteSubscription();
          createUsersSubscription();
          createVoteSubscription();

          boardQuery.first().then(async (board) => {
            const b = board?.toJSON() as unknown as BoardServerModel;
            let timerUTCEndTime;
            if (b.timerUTCEndTime != null) {
              const serverTime: string = await callAPI("getServerTime", {});
              const serverTimeInMilliseconds = Date.parse(serverTime);
              const browserTimeInMilliseconds = Date.parse(new Date().toUTCString());
              const differenceInMilliseconds = browserTimeInMilliseconds - serverTimeInMilliseconds;
              // difference > 0: Browserzeit ist vor der Serverzeit
              // difference < 0: Browserzeit ist hinter der Serverzeit
              // @ts-ignore
              const boardTimer = new Date(b.timerUTCEndTime.iso);
              timerUTCEndTime = new Date(boardTimer.getTime() + differenceInMilliseconds);
            }

            dispatch(ActionFactory.initializeBoard(mapBoardServerToClientModel({...(board?.toJSON() as unknown as BoardServerModel), timerUTCEndTime})));
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

  if (action.type === ActionType.DeleteBoard) {
    const reponse = await API.deleteBoard(action.boardId);
    console.log(reponse);
    if (reponse) {
      document.location.pathname = "/new";
    }
  }

  if (action.type === ActionType.SetTimer) {
    API.setTimer(action.endDate, stateAPI.getState().board.data!.id);
  }
  if (action.type === ActionType.CancelTimer) {
    API.cancelTimer(stateAPI.getState().board.data!.id);
  }
};
