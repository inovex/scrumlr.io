import {AccessPolicy, Template} from "store/features";

// default template with arbitrary ids (will be overwritten when submitting the first time)
export const DEFAULT_TEMPLATE: Template = {
  id: "default",
  creator: "default",
  name: "",
  accessPolicy: AccessPolicy.PUBLIC,
  description: "",
  favourite: false,
  columns: [
    {
      id: "col-1",
      name: "Column 1",
      description: "",
      index: 0,
      template: "default",
      color: "backlog-blue",
      visible: true,
    },
    {
      id: "col-2",
      name: "Column 2",
      description: "",
      index: 1,
      template: "default",
      color: "planning-pink",
      visible: true,
    },
    {
      id: "col-3",
      name: "Column 3",
      description: "",
      index: 2,
      template: "default",
      color: "poker-purple",
      visible: true,
    },
  ],
};

export const RECOMMENDED_TEMPLATES: Template[] = [
  {
    id: "recommended-1",
    creator: "scrumlr-id",
    name: "Lean Coffee",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "A flexible discussion method without a fixed agenda. Ideal for identifying & discussing important topics.",
    favourite: false,
    columns: [
      {
        id: "recommended-col-1-1",
        template: "recommended-1",
        name: "Lean Coffee",
        description: "",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
    ],
  },
  {
    id: "recommended-2",
    creator: "scrumlr-id",
    name: "Quick Review",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "Participants highlight positives & negatives incidents for quick identification of successes & issues.",
    favourite: false,
    columns: [
      {
        id: "recommended-col-2-1",
        template: "recommended-2",
        name: "Positive",
        description: "",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        id: "recommended-col-2-2",
        template: "recommended-2",
        name: "Negative",
        description: "",
        color: "poker-purple",
        visible: true,
        index: 1,
      },
    ],
  },
  {
    id: "recommended-3",
    creator: "scrumlr-id",
    name: "Cycle Check",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "The team reflects on actions to start, stop, and continue, promoting continuous improvement.",
    favourite: false,
    columns: [
      {
        id: "recommended-col-3-1",
        template: "recommended-3",
        name: "Start",
        description: "",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        id: "recommended-col-3-2",
        template: "recommended-3",
        name: "Stop",
        description: "",
        color: "goal-green",
        visible: true,
        index: 1,
      },
      {
        id: "recommended-col-3-3",
        template: "recommended-3",
        name: "Continue",
        description: "",
        color: "online-orange",
        visible: true,
        index: 2,
      },
    ],
  },
  {
    id: "recommended-4",
    creator: "scrumlr-id",
    name: "Mood",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "Participants share things that made them mad, sad, or glad. Good for understanding emotional states.",
    favourite: false,
    columns: [
      {
        id: "recommended-col-4-1",
        template: "recommended-4",
        name: "Mad",
        description: "",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        id: "recommended-col-4-2",
        template: "recommended-4",
        name: "Sad",
        description: "",
        color: "online-orange",
        visible: true,
        index: 1,
      },
      {
        id: "recommended-col-4-3",
        template: "recommended-4",
        name: "Glad",
        description: "",
        color: "poker-purple",
        visible: true,
        index: 2,
      },
    ],
  },
  {
    id: "recommended-5",
    creator: "scrumlr-id",
    name: "Kalm",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "The team identifies what to keep, add, reduce, or amplify to enhance performance.",
    favourite: false,
    columns: [
      {
        id: "recommended-col-5-1",
        template: "recommended-5",
        name: "Keep",
        description: "",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        id: "recommended-col-5-2",
        template: "recommended-5",
        name: "Add",
        description: "",
        color: "yielding-yellow",
        visible: true,
        index: 1,
      },
      {
        id: "recommended-col-5-3",
        template: "recommended-5",
        name: "Less",
        description: "",
        color: "goal-green",
        visible: true,
        index: 2,
      },
      {
        id: "recommended-col-5-4",
        template: "recommended-5",
        name: "More",
        description: "",
        color: "poker-purple",
        visible: true,
        index: 3,
      },
    ],
  },
  {
    id: "recommended-6",
    creator: "scrumlr-id",
    name: "4L",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "Participants review what they liked, learned, lacked, and longed for, encouraging feedback.",
    favourite: false,
    columns: [
      {
        id: "recommended-col-6-1",
        template: "recommended-6",
        name: "Liked",
        description: "",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        id: "recommended-col-6-2",
        template: "recommended-6",
        name: "Learned",
        description: "",
        color: "poker-purple",
        visible: true,
        index: 1,
      },
      {
        id: "recommended-col-6-3",
        template: "recommended-6",
        name: "Learned",
        description: "",
        color: "value-violet",
        visible: true,
        index: 2,
      },
      {
        id: "recommended-col-6-4",
        template: "recommended-6",
        name: "Longed for",
        description: "",
        color: "planning-pink",
        visible: true,
        index: 3,
      },
    ],
  },
  {
    id: "recommended-7",
    creator: "scrumlr-id",
    name: "SWOT",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "Analyzes strengths, weaknesses, opportunities, and threats to support strategic planning.",
    favourite: false,
    columns: [
      {
        id: "recommended-col-7-1",
        template: "recommended-7",
        name: "Strengths",
        description: "",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        id: "recommended-col-7-2",
        template: "recommended-7",
        name: "Weaknesses",
        description: "",
        color: "online-orange",
        visible: true,
        index: 1,
      },
      {
        id: "recommended-col-7-3",
        template: "recommended-7",
        name: "Opportunities",
        description: "",
        color: "goal-green",
        visible: true,
        index: 2,
      },
      {
        id: "recommended-col-7-4",
        template: "recommended-7",
        name: "Threats",
        description: "",
        color: "yielding-yellow",
        visible: true,
        index: 3,
      },
    ],
  },
];
