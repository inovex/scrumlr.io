import { AddCardTheme } from '../components/AddCard';
import { IconNames } from '../components/Icon';
import { RetroMode } from '../types';

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

const leanCoffeeModeConfiguration: PhaseConfiguration[] = [
  {
    name: 'Lean Coffee',
    description: 'Create cards, communicate your thoughts & stack common',
    columns: [
      {
        id: 'positive',
        name: 'Lean Coffee',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'positive',
          align: 'right'
        },
        sorted: false
      }
    ],
    activities: [
      { icon: 'phase1-create', description: 'Create cards' },
      { icon: 'phase1-communicate', description: 'Communicate meaning' },
      { icon: 'phase1-combine', description: 'Combine to stack' }
    ]
  },
  {
    name: 'Vote',
    description: 'Vote on the most important cards for yourself',
    columns: [
      {
        id: 'positive',
        name: 'Lean Coffee',
        type: 'positive',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: false,
          column: 'positive',
          align: 'right'
        },
        sorted: false
      }
    ],
    activities: [{ icon: 'phase2-vote', description: 'Vote wisely' }]
  },
  {
    name: 'Discuss',
    description: 'Discuss top-voted cards',
    columns: [
      {
        id: 'positive',
        name: 'Lean Coffee',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'positive',
          align: 'right'
        },
        sorted: false
      }
    ],
    activities: [{ icon: 'phase3-discuss', description: 'Discuss top-voted' }]
  }
];

const simpleRetroModeConfiguration: PhaseConfiguration[] = [
  {
    name: 'Write',
    description: 'Create cards, communicate your thoughts & stack common',
    columns: [
      {
        id: 'positive',
        name: 'Positive',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'positive',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'negative',
        name: 'Negative',
        type: 'negative',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'negative',
          align: 'left'
        },
        sorted: false
      }
    ],
    activities: [
      { icon: 'phase1-create', description: 'Create cards' },
      { icon: 'phase1-communicate', description: 'Communicate meaning' },
      { icon: 'phase1-combine', description: 'Combine to stack' }
    ]
  },
  {
    name: 'Vote',
    description: 'Vote on the most important cards for yourself',
    columns: [
      {
        id: 'positive',
        name: 'Positive',
        type: 'positive',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: false,
          column: 'positive',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'negative',
        name: 'Negative',
        type: 'negative',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: false,
          column: 'negative',
          align: 'left'
        },
        sorted: false
      }
    ],
    activities: [{ icon: 'phase2-vote', description: 'Vote wisely' }]
  },
  {
    name: 'Discuss',
    description: 'Discuss top-voted cards and define actions',
    columns: [
      {
        id: 'positive',
        name: 'Positive',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'actions',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'negative',
        name: 'Negative',
        type: 'negative',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'actions',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'actions',
        name: 'Actions',
        type: 'actions',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: false,
          column: 'actions',
          align: 'right'
        },
        sorted: true
      }
    ],
    activities: [
      { icon: 'phase3-discuss', description: 'Discuss top-voted' },
      { icon: 'phase3-define', description: 'Define actions' }
    ]
  }
];

const retroModes = {
  lean: leanCoffeeModeConfiguration,
  positiveNegative: simpleRetroModeConfiguration
};

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
