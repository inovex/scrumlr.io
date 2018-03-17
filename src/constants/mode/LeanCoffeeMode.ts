import { PhaseConfiguration } from '../Retrospective';

export default [
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
        sorted: true
      }
    ],
    activities: [{ icon: 'phase3-discuss', description: 'Discuss top-voted' }]
  }
] as PhaseConfiguration[];
