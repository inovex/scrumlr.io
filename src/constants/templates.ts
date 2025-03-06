import {TemplateWithColumns, AccessPolicy} from "store/features";
import {uniqueId} from "underscore";
import {Session} from "react-router";
import {Color} from "./colors";

export const DEFAULT_TEMPLATE_ID = "DEFAULT_TEMPLATE_ID";
const DEFAULT_TEMPLATE_COLUMN_ID_PREFIX = "DEFAULT_TEMPLATE_COLUMN_ID-";
const DEFAULT_TEMPLATE_CREATOR = "DEFAULT_CREATOR_ID";

// TODO: remove
export const DEFAULT_SESSION_ID = "DEFAULT_SESSION_ID";

export type ColumnTemplate = {
  name: string;
  description?: string;
  color: Color;
  visible: boolean;
  index: number;
};

export type BoardTemplate = {
  id: string;
  creator?: string;
  name: string;
  description?: string;
  accessPolicy: AccessPolicy;
  favourite: boolean;
  columns: ColumnTemplate[];
};

// TODO: remove
// export const DEFAULT_SESSION: Session = {
//   id: DEFAULT_SESSION_ID,
//   name: "Default Session",
//   accessPolicy: "PUBLIC",
//   description: "Lorem",
//   favourite: true,
//   columns: [
//     {
//       name: "Stuff",
//       color: "goal-green",
//       visible: true,
//       index: 0,
//       id: "",
//     },
//     {
//       name: "Actions",
//       color: "poker-purple",
//       visible: false,
//       index: 1,
//       id: "",
//     },
//   ],
//   creator: "Peter2",
// };

// TODO: remove
export const EXAMPLE_SESSIONS_FOR_SEARCH_FCT: Session[] = [
  //   {
  //     id: DEFAULT_SESSION_ID,
  //     name: "Custom Session",
  //     accessPolicy: "PUBLIC",
  //     description:
  //       "Lorem lol ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
  //       "At vero eos et accusam et justo duo dolores et ea rebum. " +
  //       "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
  //       "sed diam nonumy eirmod tempor invidunt ut " +
  //       "labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren," +
  //       " no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy " +
  //       "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, " +
  //       "sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n" +
  //       "\n" +
  //       "Duis autem vel eum iriure dolor in sshendrerit in vulputate velit esse molestie consequat, " +
  //       "vel illum doloreis eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
  //       "augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam" +
  //       " nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. \n" +
  //       "\n" +
  //       "Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit" +
  //       " lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore " +
  //       "eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. ",
  //     favourite: true,
  //     columns: [
  //       {
  //         name: "Stuff",
  //         color: "goal-green",
  //         visible: true,
  //         index: 0,
  //         id: "",
  //       },
  //       {
  //         name: "Actions",
  //         color: "poker-purple",
  //         visible: false,
  //         index: 1,
  //         id: "",
  //       },
  //     ],
  //     creator: "Peter",
  //   },
  //   {
  //     id: DEFAULT_SESSION_ID,
  //     name: "Custom Session 2",
  //     accessPolicy: "PUBLIC",
  //     description:
  //       "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
  //       "At vero eos et accusam et justo duo dolores et ea rebum. " +
  //       "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
  //       "sed diam nonumy eirmod tempor invidunt ut " +
  //       "labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren," +
  //       " no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy " +
  //       "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, " +
  //       "sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n" +
  //       "\n" +
  //       "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
  //       "vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
  //       "augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam" +
  //       " nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. \n" +
  //       "\n" +
  //       "Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit" +
  //       " lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore " +
  //       "eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. ",
  //     favourite: true,
  //     columns: [
  //       {
  //         name: "Stuff",
  //         color: "goal-green",
  //         visible: true,
  //         index: 0,
  //         id: "",
  //       },
  //       {
  //         name: "Actions",
  //         color: "poker-purple",
  //         visible: false,
  //         index: 1,
  //         id: "",
  //       },
  //     ],
  //     creator: "Peter",
  //   },
  //   {
  //     id: DEFAULT_SESSION_ID,
  //     name: "Custom Session 3",
  //     accessPolicy: "PUBLIC",
  //     description:
  //       "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
  //       "At vero eos et accusam et justo duo dolores et ea rebum. " +
  //       "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
  //       "sed diam nonumy eirmod tempor invidunt ut " +
  //       "labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren," +
  //       " no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy " +
  //       "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, " +
  //       "sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n" +
  //       "\n" +
  //       "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
  //       "vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
  //       "augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam" +
  //       " nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. \n" +
  //       "\n" +
  //       "Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit" +
  //       " lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore " +
  //       "eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. ",
  //     favourite: true,
  //     columns: [
  //       {
  //         name: "Stuff",
  //         color: "goal-green",
  //         visible: true,
  //         index: 0,
  //         id: "",
  //       },
  //       {
  //         name: "Actions",
  //         color: "poker-purple",
  //         visible: false,
  //         index: 1,
  //         id: "",
  //       },
  //     ],
  //     creator: "Peter",
  //   },
];

export const DEFAULT_TEMPLATE: TemplateWithColumns = {
  template: {
    id: DEFAULT_TEMPLATE_ID,
    creator: DEFAULT_TEMPLATE_CREATOR,
    name: "",
    accessPolicy: "PUBLIC",
    description: "",
    favourite: false,
  },
  columns: [
    {
      id: uniqueId(DEFAULT_TEMPLATE_COLUMN_ID_PREFIX),
      template: DEFAULT_TEMPLATE_ID,
      name: "Default Main",
      description: "",
      color: "backlog-blue",
      visible: true,
      index: 0,
    },
    {
      id: uniqueId(DEFAULT_TEMPLATE_COLUMN_ID_PREFIX),
      template: DEFAULT_TEMPLATE_ID,
      name: "Default Action",
      description: "",
      color: "planning-pink",
      visible: false,
      index: 1,
    },
  ],
};

export const RECOMMENDED_TEMPLATES: TemplateWithColumns[] = [
  {
    template: {
      id: "recommended-1",
      creator: "scrumlr-id",
      name: "Lean Coffee",
      accessPolicy: "PUBLIC",
      description: "A flexible discussion method without a fixed agenda. Ideal for identifying & discussing important topics.",
      favourite: false,
    },
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
    template: {
      id: "recommended-2",
      creator: "scrumlr-id",
      name: "Quick Review",
      accessPolicy: "PUBLIC",
      description: "Participants highlight positives & negatives incidents for quick identification of successes & issues.",
      favourite: false,
    },
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
    template: {
      id: "recommended-3",
      creator: "scrumlr-id",
      name: "Cycle Check",
      accessPolicy: "PUBLIC",
      description: "The team reflects on actions to start, stop, and continue, promoting continuous improvement.",
      favourite: false,
    },
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
    template: {
      id: "recommended-4",
      creator: "scrumlr-id",
      name: "Mood",
      accessPolicy: "PUBLIC",
      description: "Participants share things that made them mad, sad, or glad. Good for understanding emotional states.",
      favourite: false,
    },
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
    template: {
      id: "recommended-5",
      creator: "scrumlr-id",
      name: "Kalm",
      accessPolicy: "PUBLIC",
      description: "The team identifies what to keep, add, reduce, or amplify to enhance performance.",
      favourite: false,
    },
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
    template: {
      id: "recommended-6",
      creator: "scrumlr-id",
      name: "4L",
      accessPolicy: "PUBLIC",
      description: "Participants review what they liked, learned, lacked, and longed for, encouraging feedback.",
      favourite: false,
    },
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
    template: {
      id: "recommended-7",
      creator: "scrumlr-id",
      name: "SWOT",
      accessPolicy: "PUBLIC",
      description: "Analyzes strengths, weaknesses, opportunities, and threats to support strategic planning.",
      favourite: false,
    },
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
