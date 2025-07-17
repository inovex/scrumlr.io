import {TemplateWithColumns} from "store/features";

import {uniqueId} from "underscore";

export const DEFAULT_TEMPLATE_ID = "DEFAULT_TEMPLATE_ID";
const DEFAULT_TEMPLATE_COLUMN_ID_PREFIX = "DEFAULT_TEMPLATE_COLUMN_ID-";
const DEFAULT_TEMPLATE_CREATOR = "DEFAULT_CREATOR_ID";

export const DEFAULT_TEMPLATE: TemplateWithColumns = {
  template: {
    id: DEFAULT_TEMPLATE_ID,
    creator: DEFAULT_TEMPLATE_CREATOR,
    name: "",
    description: "",
    favourite: false,
    type: "CUSTOM",
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
