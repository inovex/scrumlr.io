import { AddCardTheme } from '../components/AddCard';
import { IconNames } from '../components/Icon';

export type ColumnType = 'positive' | 'negative' | 'actions';
export const DEFAULT_RETRO_MODE = 'positiveNegative';

export interface Activity {
  icon: IconNames;
  description: string;
}

export interface Column {
  name: string;
  type: ColumnType;
}

export interface ColumnConfiguration extends Column {
  id: string;
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
  columns: { [key: string]: ColumnConfiguration };
  activities: Activity[];
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
