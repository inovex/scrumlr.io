import leanCoffeeModeConfiguration from './LeanCoffeeMode';
import leanCoffeeWithActionsModeConfiguration from './LeanCoffeeActionsMode';
import madSadGladConfiguration from './MadSadGladMode';
import kalmConfiguration from './KALM';
import simpleRetroModeConfiguration from './PositiveNegativeMode';
import startStopContinueRetroModeConfiguration from './StartStopContinueMode';
import plusDeltaConfiguration from './PlusDeltaMode';
import fourLconfiguration from './4L';
import { PhaseConfiguration } from '../Retrospective';

interface RetroModeConfiguration {
  lean: { [key: string]: PhaseConfiguration };
  leanActions: { [key: string]: PhaseConfiguration };
  positiveNegative: { [key: string]: PhaseConfiguration };
  startStopContinue: { [key: string]: PhaseConfiguration };
  madSadGlad: { [key: string]: PhaseConfiguration };
  kalm: { [key: string]: PhaseConfiguration };
  plusDelta: { [key: string]: PhaseConfiguration };
  fourL: { [key: string]: PhaseConfiguration };
}

export const retroModes: RetroModeConfiguration = {
  lean: leanCoffeeModeConfiguration,
  leanActions: leanCoffeeWithActionsModeConfiguration,
  madSadGlad: madSadGladConfiguration,
  positiveNegative: simpleRetroModeConfiguration,
  startStopContinue: startStopContinueRetroModeConfiguration,
  kalm: kalmConfiguration,
  plusDelta: plusDeltaConfiguration,
  fourL: fourLconfiguration
};

export type RetroMode = keyof RetroModeConfiguration;

export default retroModes;
