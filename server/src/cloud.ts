import {initializeAuthFunctions} from "./cloud/auth";
import {initializeBoardFunctions} from "./cloud/board";
import {initializeColumnFunctions} from "./cloud/column";
import {initializeNoteFunctions} from "./cloud/note";
import {initializeVoteConfigurationFunctions} from "./cloud/voteConfiguration";
import {initializeVoteFunctions} from "./cloud/vote";

initializeAuthFunctions();
initializeBoardFunctions();
initializeColumnFunctions();
initializeNoteFunctions();
initializeVoteConfigurationFunctions();
initializeVoteFunctions();
