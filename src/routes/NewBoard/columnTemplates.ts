import {Color} from "constants/colors";

export const columnTemplates: {[key: string]: {name: string; hidden: boolean; color: Color}[]} = {
  "Lean Coffee": [
    {name: "Lean Coffee", hidden: false, color: "grooming-green"},
    {name: "Actions", hidden: true, color: "backlog-blue"},
  ],
  "Positive/Negative": [
    {name: "Positive", hidden: false, color: "backlog-blue"},
    {name: "Negative", hidden: false, color: "lean-lilac"},
    {name: "Actions", hidden: true, color: "planning-pink"},
  ],
  "Start/Stop/Continue": [
    {name: "Start", hidden: false, color: "grooming-green"},
    {name: "Stop", hidden: false, color: "retro-red"},
    {name: "Continue", hidden: false, color: "backlog-blue"},
  ],
  "Mad/Sad/Glad": [
    {name: "Mad", hidden: false, color: "online-orange"},
    {name: "Sad", hidden: false, color: "retro-red"},
    {name: "Glad", hidden: false, color: "poker-purple"},
    {name: "Actions", hidden: true, color: "planning-pink"},
  ],
  "KALM (Keep/Add/Less/More)": [
    {name: "Keep", hidden: false, color: "grooming-green"},
    {name: "Add", hidden: false, color: "retro-red"},
    {name: "Less", hidden: false, color: "backlog-blue"},
    {name: "More", hidden: false, color: "poker-purple"},
    {name: "Actions", hidden: true, color: "planning-pink"},
  ],
  "Plus & Delta": [
    {name: "Plus", hidden: false, color: "backlog-blue"},
    {name: "Delta", hidden: false, color: "lean-lilac"},
    {name: "Actions", hidden: true, color: "planning-pink"},
  ],
  "4L (Liked, Learned, Lacked, Longed for)": [
    {name: "Liked", hidden: false, color: "grooming-green"},
    {name: "Learned", hidden: false, color: "retro-red"},
    {name: "Lacked", hidden: false, color: "backlog-blue"},
    {name: "Longed for", hidden: false, color: "poker-purple"},
    {name: "Actions", hidden: true, color: "planning-pink"},
  ],
};
