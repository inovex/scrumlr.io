import { AddCardTheme } from '../components/AddCard';
import { IconNames } from '../components/Icon';

export type RetroMode = 'lean' | 'positiveNegative';
export type ColumnType = 'positive' | 'negative' | 'actions';

export interface PhaseActivity {
  icon: IconNames;
  description: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
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

export interface RetroPhase {
  name: string;
  description: string;
  columns: Column[];
  activities: PhaseActivity[];
}

const leanCoffeeModeConfiguration: RetroPhase[] = [
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

const simpleRetroModeConfiguration: RetroPhase[] = [
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
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'negative',
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

export function getPhaseConfiguration(
  retroMode: RetroMode,
  phase: number
): RetroPhase & { index: number } {
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
