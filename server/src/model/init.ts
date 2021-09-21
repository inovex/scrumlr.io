import Parse from "parse/node";

const addInitialBoardSchema = async () => {
  const schema = new Parse.Schema("Board");
  schema.addString("name");
  schema.addPointer("owner", "_User", {required: true});
  schema.addPointer("template", "Template");
  schema.addObject("columns", {defaultValue: {}});
  schema.addBoolean("joinConfirmationRequired", {defaultValue: false});
  schema.addBoolean("encryptedContent", {defaultValue: false});
  schema.addString("accessCode");
  schema.addBoolean("showContentOfOtherUsers", {defaultValue: true});
  schema.addBoolean("showAuthors", {defaultValue: true});
  schema.addDate("timerUTCEndTime");
  schema.addDate("expirationUTCTime");
  schema.addString("voting", {defaultValue: "disabled"});
  schema.addNumber("votingIteration", {required: true, defaultValue: 0});
  schema.addBoolean("showVotesOfOtherUsers", {defaultValue: false});
  schema.addNumber("voteLimit", {defaultValue: 0});
  schema.addNumber("schemaVersion", {required: true, defaultValue: 1});
  return schema.save();
};

const addInitialNoteSchema = async () => {
  const schema = new Parse.Schema("Note");
  schema.addPointer("board", "Board", {required: true});
  schema.addPointer("parent", "Note", {required: false});
  schema.addString("columnId", {required: true});
  schema.addPointer("author", "_User", {required: true});
  schema.addString("text", {required: true});
  schema.addNumber("schemaVersion", {required: true, defaultValue: 1});
  return schema.save();
};

const addInitialVoteSchema = async () => {
  const schema = new Parse.Schema("Vote");
  schema.addPointer("board", "Board", {required: true});
  schema.addPointer("note", "Note", {required: true});
  schema.addPointer("user", "_User", {required: true});
  schema.addNumber("votingIteration", {required: true, defaultValue: 0});
  schema.addNumber("schemaVersion", {required: true, defaultValue: 1});
  return schema.save();
};

const addInitialJoinRequestSchema = async () => {
  const schema = new Parse.Schema("JoinRequest");
  schema.addPointer("user", "_User", {required: true});
  schema.addPointer("board", "Board", {required: true});
  schema.addString("status", {required: true, defaultValue: "pending"});
  schema.addString("accessKey");
  schema.addNumber("schemaVersion", {required: true, defaultValue: 1});
  return schema.save();
};

export const initServer = async (appId: string, serverUrl: string, masterKey: string) => {
  Parse.initialize(appId);
  Parse.serverURL = serverUrl;
  Parse.masterKey = masterKey;

  const config = await Parse.Config.get({useMasterKey: true});
  const versions = config.get("versions");
  if (!versions) {
    await addInitialBoardSchema();
    await addInitialNoteSchema();
    await addInitialJoinRequestSchema();
    await addInitialVoteSchema();
    console.log("Initialized schema");

    await Parse.Config.save({
      versions: {
        Board: 1,
        Note: 1,
        JoinRequest: 1,
        Vote: 1,
      },
    });
  }

  // check for schema versions and migrate schemes here
  // if (versions.Board === 1) { ... }
};
