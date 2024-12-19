import {Color} from "constants/colors";

export const legacyColumnTemplates: {[id: string]: {name: string; description?: string; columns: {name: string; visible: boolean; color: Color}[]}} = {
  leanCoffee: {
    name: "Lean Coffee",
    columns: [
      {name: "Lean Coffee", visible: true, color: "backlog-blue"},
      {name: "Actions", visible: false, color: "planning-pink"},
    ],
  },
  positiveNegative: {
    name: "Positive/Negative",
    columns: [
      {name: "Positive", visible: true, color: "backlog-blue"},
      {name: "Negative", visible: true, color: "poker-purple"},
      {name: "Actions", visible: false, color: "planning-pink"},
    ],
  },
  startStopContinue: {
    name: "Start/Stop/Continue",
    columns: [
      {name: "Start", visible: true, color: "backlog-blue"},
      {name: "Stop", visible: true, color: "goal-green"},
      {name: "Continue", visible: true, color: "online-orange"},
      {name: "Actions", visible: false, color: "planning-pink"},
    ],
  },
  madSadGlad: {
    name: "Mad/Sad/Glad",
    columns: [
      {name: "Mad", visible: true, color: "backlog-blue"},
      {name: "Sad", visible: true, color: "online-orange"},
      {name: "Glad", visible: true, color: "poker-purple"},
      {name: "Actions", visible: false, color: "planning-pink"},
    ],
  },
  plusDelta: {
    name: "Plus/Delta",
    columns: [
      {name: "Plus", visible: true, color: "backlog-blue"},
      {name: "Delta", visible: true, color: "poker-purple"},
      {name: "Actions", visible: false, color: "planning-pink"},
    ],
  },
  kalm: {
    name: "KALM",
    description: "Keep, Add, Less, More",
    columns: [
      {name: "Keep", visible: true, color: "backlog-blue"},
      {name: "Add", visible: true, color: "yielding-yellow"},
      {name: "Less", visible: true, color: "goal-green"},
      {name: "More", visible: true, color: "poker-purple"},
      {name: "Actions", visible: false, color: "planning-pink"},
    ],
  },
  fourL: {
    name: "4L",
    description: "Liked, Learned, Lacked, Longed for",
    columns: [
      {name: "Liked", visible: true, color: "backlog-blue"},
      {name: "Learned", visible: true, color: "yielding-yellow"},
      {name: "Lacked", visible: true, color: "value-violet"},
      {name: "Longed for", visible: true, color: "poker-purple"},
      {name: "Actions", visible: false, color: "planning-pink"},
    ],
  },
  swot: {
    name: "SWOT",
    description: "Strengths, Weaknesses, Opportunities, Threats",
    columns: [
      {name: "Strengths", visible: true, color: "backlog-blue"},
      {name: "Weaknesses", visible: true, color: "online-orange"},
      {name: "Opportunities", visible: true, color: "goal-green"},
      {name: "Threats", visible: true, color: "yielding-yellow"},
      {name: "Actions", visible: false, color: "poker-purple"},
    ],
  },
};
