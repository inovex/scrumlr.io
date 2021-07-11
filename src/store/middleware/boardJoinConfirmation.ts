import {Dispatch, MiddlewareAPI, AnyAction} from "redux";
import Parse from "parse";
import {ApplicationState} from "types/store";
import {ActionFactory, ActionType, ReduxAction} from "store/action";
import {API} from "api";

export const passBoardJoinConfirmationMiddleware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ActionType.JoinBoard) {
    API.joinBoard(action.boardId).then((response) => {
      // explicit 'store.dispatch' is required here or otherwise this middleware wont be called again
      if (response.status === "accepted") {
        stateAPI.dispatch(ActionFactory.permittedBoardAccess(action.boardId));
      } else if (response.status === "rejected") {
        stateAPI.dispatch(ActionFactory.rejectedBoardAccess());
      } else if (response.status === "pending") {
        stateAPI.dispatch(ActionFactory.pendingBoardAccessConfirmation(response.joinRequestReference!));
      }
    });
  }

  if (action.type === ActionType.PendingBoardAccessConfirmation) {
    const joinRequestQuery = new Parse.Query("JoinRequest");
    joinRequestQuery.equalTo("objectId", action.requestReference);
    joinRequestQuery.subscribe().then((subscription) => {
      const checkRequestStatus = (request: Parse.Object) => {
        switch (request.get("status")) {
          case "accepted": {
            stateAPI.dispatch(ActionFactory.joinBoard(request.get("board").id));
            subscription.unsubscribe();
            break;
          }
          case "rejected": {
            stateAPI.dispatch(ActionFactory.rejectedBoardAccess());
            subscription.unsubscribe();
            break;
          }
          default: {
            subscription.unsubscribe();
            break;
          }
        }
      };
      subscription.on("update", (request) => {
        checkRequestStatus(request);
      });

      subscription.on("open", () => {
        joinRequestQuery.first().then((request) => {
          if (request) {
            checkRequestStatus(request);
          }
        });
      });
    });
  }
};
