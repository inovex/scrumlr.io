import leanCoffeeModeConfiguration from './LeanCoffeeMode';
import madSadGladConfiguration from './MadSadGladMode';
import kalmConfiguration from './KALM';
import simpleRetroModeConfiguration from './PositiveNegativeMode';
import startStopContinueRetroModeConfiguration from './StartStopContinueMode';
import plusDeltaConfiguration from './PlusDeltaMode';
import fourLconfiguration from './4L';
import meetupConfiguration from './MeetupMode';
import { PhaseConfiguration } from '../Retrospective';

interface RetroModeConfiguration {
  lean: { [key: string]: PhaseConfiguration };
  positiveNegative: { [key: string]: PhaseConfiguration };
  startStopContinue: { [key: string]: PhaseConfiguration };
  madSadGlad: { [key: string]: PhaseConfiguration };
  kalm: { [key: string]: PhaseConfiguration };
  plusDelta: { [key: string]: PhaseConfiguration };
  fourL: { [key: string]: PhaseConfiguration };
  meetup: { [key: string]: PhaseConfiguration };
}

export const retroModes: RetroModeConfiguration = {
  lean: leanCoffeeModeConfiguration,
  madSadGlad: madSadGladConfiguration,
  positiveNegative: simpleRetroModeConfiguration,
  startStopContinue: startStopContinueRetroModeConfiguration,
  kalm: kalmConfiguration,
  plusDelta: plusDeltaConfiguration,
  fourL: fourLconfiguration,
  meetup: meetupConfiguration
};

export type RetroMode = keyof RetroModeConfiguration;

export default retroModes;
