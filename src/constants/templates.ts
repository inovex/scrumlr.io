import {AccessPolicy} from "store/features";
import {Color} from "./colors";

// TODO define types in store instead
export type ColumnTemplate = {
  name: string;
  description?: string;
  color: Color;
  visible: boolean;
  index: number;
};

export type BoardTemplate = {
  creator?: string;
  name: string;
  description?: string;
  accessPolicy: AccessPolicy;
  favourite: boolean;
  columns: ColumnTemplate[];
};

export const EXAMPLE_CUSTOM_TEMPLATE: BoardTemplate = {
  name: "Custom Template",
  accessPolicy: AccessPolicy.BY_PASSPHRASE,
  description:
    "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
    "At vero eos et accusam et justo duo dolores et ea rebum. " +
    "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
    "sed diam nonumy eirmod tempor invidunt ut " +
    "labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren," +
    " no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy " +
    "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, " +
    "sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n" +
    "\n" +
    "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
    "vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
    "augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam" +
    " nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. \n" +
    "\n" +
    "Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit" +
    " lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore " +
    "eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. ",
  favourite: true,
  columns: [
    {
      name: "Stuff",
      color: "goal-green",
      visible: true,
      index: 0,
    },
    {
      name: "Actions",
      color: "poker-purple",
      visible: false,
      index: 1,
    },
  ],
};

export const RECOMMENDED_TEMPLATES: BoardTemplate[] = [
  {
    name: "Lean Coffee",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "A flexible discussion method without a fixed agenda. Ideal for identifying & discussing important topics.",
    favourite: false,
    columns: [
      {
        name: "Lean Coffee",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
    ],
  },
  {
    name: "Quick Review",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "Participants highlight positives & negatives incidents for quick identification of successes & issues.",
    favourite: false,
    columns: [
      {
        name: "Positive",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        name: "Negative",
        color: "poker-purple",
        visible: true,
        index: 1,
      },
    ],
  },
  {
    name: "Cycle Check",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "The team reflects on actions to start, stop, and continue, promoting continuous improvement.",
    favourite: false,
    columns: [
      {
        name: "Start",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        name: "Stop",
        color: "goal-green",
        visible: true,
        index: 1,
      },
      {
        name: "Continue",
        color: "online-orange",
        visible: true,
        index: 2,
      },
    ],
  },
  {
    name: "Mood",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "Participants share things that made them mad, sad, or glad. Good for understanding emotional states.",
    favourite: false,
    columns: [
      {
        name: "Mad",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        name: "Sad",
        color: "online-orange",
        visible: true,
        index: 1,
      },
      {
        name: "Glad",
        color: "poker-purple",
        visible: true,
        index: 2,
      },
    ],
  },
  {
    name: "Kalm",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "The team identifies what to keep, add, reduce, or amplify to enhance performance.",
    favourite: false,
    columns: [
      {
        name: "Keep",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        name: "Add",
        color: "yielding-yellow",
        visible: true,
        index: 1,
      },
      {
        name: "Less",
        color: "goal-green",
        visible: true,
        index: 2,
      },
      {
        name: "More",
        color: "poker-purple",
        visible: true,
        index: 3,
      },
    ],
  },
  {
    name: "4L",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "Participants review what they liked, learned, lacked, and longed for, encouraging feedback.",
    favourite: false,
    columns: [
      {
        name: "Liked",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        name: "Learned",
        color: "poker-purple",
        visible: true,
        index: 1,
      },
      {
        name: "Learned",
        color: "value-violet",
        visible: true,
        index: 2,
      },
      {
        name: "Longed for",
        color: "planning-pink",
        visible: true,
        index: 3,
      },
    ],
  },
  {
    name: "SWOT",
    accessPolicy: AccessPolicy.PUBLIC,
    description: "Analyzes strengths, weaknesses, opportunities, and threats to support strategic planning.",
    favourite: false,
    columns: [
      {
        name: "Strengths",
        color: "backlog-blue",
        visible: true,
        index: 0,
      },
      {
        name: "Weaknesses",
        color: "online-orange",
        visible: true,
        index: 1,
      },
      {
        name: "Opportunities",
        color: "goal-green",
        visible: true,
        index: 2,
      },
      {
        name: "Threats",
        color: "yielding-yellow",
        visible: true,
        index: 3,
      },
    ],
  },
];
