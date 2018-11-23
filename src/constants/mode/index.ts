import leanCoffeeModeConfiguration from './LeanCoffeeMode';
import madSadGladConfiguration from './MadSadGladMode';
import kalmConfiguration from './KALM';
import simpleRetroModeConfiguration from './PositiveNegativeMode';
import startStopContinueRetroModeConfiguration from './StartStopContinueMode';
import { PhaseConfiguration } from '../Retrospective';

interface RetroModeConfiguration {
  lean: PhaseConfiguration[];
  positiveNegative: PhaseConfiguration[];
  startStopContinue: PhaseConfiguration[];
  madSadGlad: PhaseConfiguration[];
  kalm: PhaseConfiguration[];
}

export const retroModes: RetroModeConfiguration = {
  lean: leanCoffeeModeConfiguration,
  madSadGlad: madSadGladConfiguration,
  positiveNegative: simpleRetroModeConfiguration,
  startStopContinue: startStopContinueRetroModeConfiguration,
  kalm: kalmConfiguration
};

export type RetroMode = keyof RetroModeConfiguration;

export default retroModes;
