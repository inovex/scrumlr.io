import { AddCardTheme } from '../components/AddCard';
import { IconNames } from '../components/Icon';
import retroModes, { RetroMode } from './mode';

export type ColumnType = 'positive' | 'negative' | 'actions';

export interface Activity {
  icon: IconNames;
  description: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
}

export interface ColumnConfiguration extends Column {
  voting: {
    enabled: boolean;
    displayed: boolean;
  };
  focus: {
    enabled: boolean;
    column: string;
    align: 'left' | 'right';
  };
  sorted: boolean;
}

export interface PhaseConfiguration {
  name: string;
  description: string;
  columns: ColumnConfiguration[];
  activities: Activity[];
}

export interface IndexedPhaseConfiguration extends PhaseConfiguration {
  index: number;
}

export function getPhasesCount(retroMode: RetroMode) {
  return retroModes[retroMode].length;
}

export function getPhaseConfiguration(
  retroMode: RetroMode,
  phase: number
): IndexedPhaseConfiguration {
  return { index: phase, ...retroModes[retroMode][phase] };
}

export function getTheme(type: ColumnType): AddCardTheme {
  switch (type) {
    case 'negative':
      return 'dark';
    case 'actions':
      return 'mint';
    case 'positive':
    default:
      return 'light';
  }
}

export function getInversedTheme(type: ColumnType): AddCardTheme {
  switch (type) {
    case 'negative':
      return 'light';
    case 'actions':
    case 'positive':
    default:
      return 'dark';
  }
}
