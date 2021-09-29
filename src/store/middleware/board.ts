import {Dispatch, MiddlewareAPI, AnyAction} from "redux";
import {ApplicationState} from "types/store";
import Parse from "parse";
import {mapUserServerToClientModel, UserServerModel} from "types/user";
import {mapNoteServerToClientModel, NoteServerModel} from "types/note";
import {mapVoteServerToClientModel, VoteServerModel} from "types/vote";
import {mapVoteConfigurationServerToClientModel, VoteConfigurationServerModel} from "types/voteConfiguration";
import {BoardServerModel, mapBoardServerToClientModel} from "types/board";
import {JoinRequestServerModel, mapJoinRequestServerToClientModel} from "types/joinRequest";
import {ActionFactory, ActionType, ReduxAction} from "store/action";
import {API} from "api";
import {Toast} from "utils/Toast";
import {getBrowserServerTimeDifference} from "utils/timer";
import {StatusResponse} from "types";

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

      // Subscription to detect changes in the user configuration
      const updateQuery = new Parse.Query(Parse.User);
      updateQuery.contains("boards", action.boardId);
      updateQuery.subscribe().then((subscription) => {
        closeSubscriptions.push(() => {
          subscription.unsubscribe();
        });
        subscription.on("update", (result) => {
          dispatch(ActionFactory.updateUser(result.toJSON() as unknown as UserServerModel));
        });
      });

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
      const board = Parse.Object.extend("Board").createWithoutData(action.boardId);
      voteQuery.equalTo("board", board);
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
          voteQuery
            .equalTo("votingIteration", board.get("votingIteration"))
            .find()
            .then((results) => {
              dispatch(ActionFactory.initializeVotes((results as VoteServerModel[]).map(mapVoteServerToClientModel)));
            });
        });
      });
    };

    const createVoteConfigurationSubscription = () => {
      const voteConfigurationQuery = new Parse.Query("VoteConfiguration");
      const board = Parse.Object.extend("Board").createWithoutData(action.boardId);
      voteConfigurationQuery.equalTo("board", board);
      voteConfigurationQuery.subscribe().then((subscription) => {
        closeSubscriptions.push(() => {
          subscription.unsubscribe();
        });
        subscription.on("create", (object) => {
          dispatch(ActionFactory.addedVoteConfiguration(mapVoteConfigurationServerToClientModel(object as VoteConfigurationServerModel)));
        });
        subscription.on("delete", (object) => {
          dispatch(ActionFactory.removedVoteConfiguration(mapVoteConfigurationServerToClientModel(object as VoteConfigurationServerModel)));
        });
        subscription.on("open", () => {
          voteConfigurationQuery
            .equalTo("votingIteration", board.get("votingIteration"))
            .first()
            .then((result) => {
              if (result) {
                dispatch(ActionFactory.initializeVoteConfiguration(mapVoteConfigurationServerToClientModel(result as unknown as VoteConfigurationServerModel)));
              }
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
          const difference = await getBrowserServerTimeDifference();
          // @ts-ignore
          timerUTCEndTime = new Date(new Date(board.timerUTCEndTime.iso).getTime() + difference);
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
          createVoteConfigurationSubscription();
          createNoteSubscription();
          createUsersSubscription();
          createVoteSubscription();

          boardQuery.first().then(async (board) => {
            const b = board?.toJSON() as unknown as BoardServerModel;
            let timerUTCEndTime;
            if (b.timerUTCEndTime != null) {
              const difference = await getBrowserServerTimeDifference();
              // @ts-ignore
              timerUTCEndTime = new Date(new Date(b.timerUTCEndTime.iso).getTime() + difference);
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
  if (action.type === ActionType.CancelVoting) {
    const response = (await API.cancelVoting(action.boardId)) as StatusResponse;
    if (response.status === "Error") {
      Toast.error(response.description);
    }
  }
  if (action.type === ActionType.SetTimer) {
    const difference = await getBrowserServerTimeDifference();
    API.setTimer(new Date(action.endDate.getTime() - difference), stateAPI.getState().board.data!.id);
  }
  if (action.type === ActionType.CancelTimer) {
    API.cancelTimer(stateAPI.getState().board.data!.id);
  }
};
