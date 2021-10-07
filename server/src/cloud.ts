import {initializeBoardFunctions} from "./cloud/board";
import {initializeNoteFunctions} from "./cloud/note";
import {initializeVoteFunctions} from "./cloud/vote";
import {initializeColumnFunctions} from "./cloud/column";
import {initializeUserFunctions} from "./cloud/user";
import {initializeVoteConfigurationFunctions} from "./cloud/voteConfiguration";

initializeBoardFunctions();
initializeColumnFunctions();
initializeVoteConfigurationFunctions();
initializeNoteFunctions();
initializeVoteFunctions();
initializeUserFunctions();
