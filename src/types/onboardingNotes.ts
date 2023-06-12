import {AvataaarProps} from "components/Avatar";
import {Participant} from "./participant";

export interface OnboardingNote {
  id: string;
  onboardingAuthor: string;
}

export type OnboardingNotesState = OnboardingNote[];

export interface OnboardingAuthorAvatar {
  onboardingAuthor: string;
  avatar: AvataaarProps;
  ready: boolean;
  raisedHand: boolean;
}

export const onboardingAuthors: Participant[] = [
  {
    user: {
      id: "onboarding-Mike",
      name: "Mike",
      avatar: {
        accentColorClass: "accent-color__grooming-green",
        skinColor: "Tanned",
        topType: "ShortHairShortWaved",
        graphicType: "Skull",
        clotheColor: "Gray01",
        clotheType: "BlazerSweater",
        hairColor: "Brown",
        facialHairColor: "Brown",
        facialHairType: "MoustacheFancy",
        accessoriesType: "Sunglasses",
        eyeType: "Wink",
        eyebrowType: "Default",
        mouthType: "Smile",
      },
    },
    ready: false,
    raisedHand: false,
    showHiddenColumns: false,
    connected: true,
    role: "PARTICIPANT",
  },
];
