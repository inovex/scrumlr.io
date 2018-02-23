import { AddCardTheme } from '../components/AddCard';
import { IconNames } from '../components/Icon/types';

export type ColumnType = 'positive' | 'negative' | 'actions';

export interface PhaseActivity {
  icon: IconNames;
  description: string;
}

export interface RetrospectivePhaseConfiguration {
  index: number;
  name: string;
  description: string;
  votesAllowed: boolean;
  showVotes: boolean;
  sorted: boolean;
  shownColumns: ColumnType[];
  activities: PhaseActivity[];
}

export const RETRO_PHASES: RetrospectivePhaseConfiguration[] = [
  {
    index: 1,
    name: 'Write',
    description: 'Create cards, communicate your thoughts & stack common',
    votesAllowed: false,
    showVotes: false,
    sorted: false,
    shownColumns: ['positive', 'negative'],
    activities: [
      { icon: 'phase1-create', description: 'Create cards' },
      { icon: 'phase1-communicate', description: 'Communicate meaning' },
      { icon: 'phase1-combine', description: 'Combine to stack' }
    ]
  },
  {
    index: 2,
    name: 'Vote',
    description: 'Vote on the most important cards for yourself',
    votesAllowed: true,
    showVotes: false,
    sorted: false,
    shownColumns: ['positive', 'negative'],
    activities: [{ icon: 'phase2-vote', description: 'Vote wisely' }]
  },
  {
    index: 3,
    name: 'Discuss',
    description: 'Discuss top-voted cards and define actions',
    votesAllowed: false,
    showVotes: true,
    sorted: true,
    shownColumns: ['positive', 'negative', 'actions'],
    activities: [
      { icon: 'phase3-discuss', description: 'Discuss top-voted' },
      { icon: 'phase3-define', description: 'Define actions' }
    ]
  }
];
export const RETRO_PHASES_MAX_INDEX = RETRO_PHASES.length - 1;

export function getPhaseConfiguration(
  phase: number
): RetrospectivePhaseConfiguration {
  return RETRO_PHASES[phase];
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

export function getColumnName(type: ColumnType): string {
  switch (type) {
    case 'positive':
      return 'Positive';
    case 'negative':
      return 'Negative';
    case 'actions':
      return 'Actions';
    default:
      return 'Unknown';
  }
}
