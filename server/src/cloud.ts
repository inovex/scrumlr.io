import {initializeAuthFunctions} from "./cloud/auth";
import {initializeBoardFunctions} from "./cloud/board";
import {initializeColumnFunctions} from "./cloud/column";
import {initializeNoteFunctions} from "./cloud/note";
import {initializeUserFunctions} from "./cloud/user";
import {initializeVoteConfigurationFunctions} from "./cloud/voteConfiguration";
import {initializeVoteFunctions} from "./cloud/vote";
import {initializeUserOnlineStatus} from "./cloud/userOnlineStatus";

initializeAuthFunctions();
initializeBoardFunctions();
initializeColumnFunctions();
initializeNoteFunctions();
initializeUserFunctions();
initializeVoteConfigurationFunctions();
initializeVoteFunctions();
initializeUserOnlineStatus();
