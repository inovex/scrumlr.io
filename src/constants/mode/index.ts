import leanCoffeeModeConfiguration from './LeanCoffeeMode';
import simpleRetroModeConfiguration from './PositiveNegativeMode';
import startStopContinueRetroModeConfiguration from './StartStopContinueMode';
import { PhaseConfiguration } from '../Retrospective';

interface RetroModeConfiguration {
  lean: PhaseConfiguration[];
  positiveNegative: PhaseConfiguration[];
  startStopContinue: PhaseConfiguration[];
}

export const retroModes: RetroModeConfiguration = {
  lean: leanCoffeeModeConfiguration,
  positiveNegative: simpleRetroModeConfiguration,
  startStopContinue: startStopContinueRetroModeConfiguration
};

export type RetroMode = keyof RetroModeConfiguration;

export default retroModes;
