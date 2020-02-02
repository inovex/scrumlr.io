import { PhaseConfiguration } from '../Retrospective';

export default [
  {
    name: 'Write',
    description: 'Create cards, communicate your thoughts & stack common',
    columns: [
      {
        id: 'liked',
        name: 'Liked',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'liked',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'learned',
        name: 'Learned',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'learned',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'lacked',
        name: 'Lacked',
        type: 'negative',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'lacked',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'longedfor',
        name: 'Longed for',
        type: 'negative',
        voting: {
          enabled: false,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'longedfor',
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
        id: 'liked',
        name: 'Liked',
        type: 'positive',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'liked',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'learned',
        name: 'Learned',
        type: 'positive',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'learned',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'lacked',
        name: 'Lacked',
        type: 'negative',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'lacked',
          align: 'right'
        },
        sorted: false
      },
      {
        id: 'longedfor',
        name: 'Longed for',
        type: 'negative',
        voting: {
          enabled: true,
          displayed: false
        },
        focus: {
          enabled: true,
          column: 'longedfor',
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
        id: 'liked',
        name: 'Liked',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'liked',
          align: 'right'
        },
        sorted: true
      },
      {
        id: 'learned',
        name: 'Learned',
        type: 'positive',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'learned',
          align: 'right'
        },
        sorted: true
      },
      {
        id: 'lacked',
        name: 'Lacked',
        type: 'negative',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'lacked',
          align: 'right'
        },
        sorted: true
      },
      {
        id: 'longedfor',
        name: 'Longed for',
        type: 'negative',
        voting: {
          enabled: false,
          displayed: true
        },
        focus: {
          enabled: true,
          column: 'longedfor',
          align: 'right'
        },
        sorted: true
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
        sorted: false
      }
    ],
    activities: [{ icon: 'phase3-discuss', description: 'Discuss top-voted' }]
  }
] as PhaseConfiguration[];
