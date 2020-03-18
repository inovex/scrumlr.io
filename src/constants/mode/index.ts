import leanCoffeeModeConfiguration from './LeanCoffeeMode';
import madSadGladConfiguration from './MadSadGladMode';
import kalmConfiguration from './KALM';
import simpleRetroModeConfiguration from './PositiveNegativeMode';
import startStopContinueRetroModeConfiguration from './StartStopContinueMode';
import plusDeltaConfiguration from './PlusDeltaMode';
import fourLconfiguration from './4L';
import { PhaseConfiguration } from '../Retrospective';

interface RetroModeConfiguration {
  lean: PhaseConfiguration[];
  positiveNegative: PhaseConfiguration[];
  startStopContinue: PhaseConfiguration[];
  madSadGlad: PhaseConfiguration[];
  kalm: PhaseConfiguration[];
  plusDelta: PhaseConfiguration[];
  fourL: PhaseConfiguration[];
}

export const retroModes: RetroModeConfiguration = {
  lean: leanCoffeeModeConfiguration,
  madSadGlad: madSadGladConfiguration,
  positiveNegative: simpleRetroModeConfiguration,
  startStopContinue: startStopContinueRetroModeConfiguration,
  kalm: kalmConfiguration,
  plusDelta: plusDeltaConfiguration,
  fourL: fourLconfiguration
};

export type RetroMode = keyof RetroModeConfiguration;

export default retroModes;
