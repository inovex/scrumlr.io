export const initializeUserOnlineStatus = () => {
  (Parse.Cloud as any).onLiveQueryEvent(({event, sessionToken}) => {
    if (event === "ws_disconnect") {
      const query = new Parse.Query<Parse.Object>("_Session");

      query.equalTo("sessionToken", sessionToken);
      query.first({useMasterKey: true}).then((session) => {
        if (session) {
          const user = session.get("user");
          user.remove("boards", session.id);
          user.save(null, {useMasterKey: true});
        }
      });
    }
  });
};
