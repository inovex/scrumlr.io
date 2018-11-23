import { PhaseConfiguration } from '../Retrospective';

export default [
  {
    name: 'Write',
    description: 'Create cards, communicate your thoughts & stack common',
    columns: [
      {
        id: 'keep',
        name: 'Keep',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'keep',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'add',
        name: 'Add',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'add',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'less',
        name: 'Less',
        type: 'negative',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'less',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'more',
        name: 'More',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'more',
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
        id: 'keep',
        name: 'Keep',
        type: 'positive',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'keep',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'add',
        name: 'Add',
        type: 'positive',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'add',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'less',
        name: 'Less',
        type: 'negative',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'less',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'more',
        name: 'More',
        type: 'positive',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'more',
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
        id: 'keep',
        name: 'Keep',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'keep',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'add',
        name: 'Add',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'add',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'less',
        name: 'Less',
        type: 'negative',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'less',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'more',
        name: 'More',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'more',
          align: 'right'
        },
        sorted: false
      }
    ],
    activities: [{ icon: 'phase3-discuss', description: 'Discuss top-voted' }]
  }
] as PhaseConfiguration[];
