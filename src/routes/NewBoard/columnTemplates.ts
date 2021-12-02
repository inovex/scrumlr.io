import {Color} from "constants/colors";

export const columnTemplates: {[id: string]: {name: string; description?: string; columns: {name: string; hidden: boolean; color: Color}[]}} = {
  leanCoffee: {
    name: "Lean Coffee",
    columns: [
      {name: "Lean Coffee", hidden: false, color: "backlog-blue"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
  },
  positiveNegative: {
    name: "Positive/Negative",
    columns: [
      {name: "Positive", hidden: false, color: "backlog-blue"},
      {name: "Negative", hidden: false, color: "lean-lilac"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
  },
  startStopContinue: {
    name: "Start/Stop/Continue",
    columns: [
      {name: "Start", hidden: false, color: "backlog-blue"},
      {name: "Stop", hidden: false, color: "grooming-green"},
      {name: "Continue", hidden: false, color: "planning-pink"},
    ],
  },
  madSadGlad: {
    name: "Mad/Sad/Glad",
    columns: [
      {name: "Mad", hidden: false, color: "backlog-blue"},
      {name: "Sad", hidden: false, color: "online-orange"},
      {name: "Glad", hidden: false, color: "poker-purple"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
  },
  kalm: {
    name: "Keep/Add/Less/More",
    columns: [
      {name: "Keep", hidden: false, color: "backlog-blue"},
      {name: "Add", hidden: false, color: "retro-red"},
      {name: "Less", hidden: false, color: "grooming-green"},
      {name: "More", hidden: false, color: "poker-purple"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
  },
  plusDelta: {
    name: "Plus & Delta",
    columns: [
      {name: "Plus", hidden: false, color: "backlog-blue"},
      {name: "Delta", hidden: false, color: "lean-lilac"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
  },
  fourL: {
    name: "4L",
    description: "Liked, Learned, Lacked, Longed for",
    columns: [
      {name: "Liked", hidden: false, color: "backlog-blue"},
      {name: "Learned", hidden: false, color: "retro-red"},
      {name: "Lacked", hidden: false, color: "lean-lilac"},
      {name: "Longed for", hidden: false, color: "poker-purple"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
  },
};
