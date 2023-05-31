import { AvataaarProps } from "components/Avatar";

export interface OnboardingNote {
  id: string;
  onboardingAuthor: string;
}

export type OnboardingNotesState = OnboardingNote[];

export interface OnboardingAuthorAvatar {
  onboardingAuthor: string;
  avatar: AvataaarProps
}

export const onboardingAuthorAvatars: OnboardingAuthorAvatar[] = [
  {
    onboardingAuthor: "Mike",
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
      mouthType: "Smile"
    }
  }
]
