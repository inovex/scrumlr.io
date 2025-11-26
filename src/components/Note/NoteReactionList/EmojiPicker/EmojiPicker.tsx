import React, {useEffect, useRef, useState} from "react";
import {Database} from "emoji-picker-element";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {setSkinTone} from "store/features";
import {SkinToneName} from "store/features/skinTone/types";
import "./EmojiPicker.scss";

export interface EmojiClickData {
  annotation: string;
  order: number;
  shortcodes: string[];
  skinTone: number;
  tags: string[];
  unicode: string;
}

export interface SkinToneChangeData {
  skinTone: number;
}

interface EmojiPickerProps extends React.HTMLAttributes<HTMLElement> {
  onEmojiClick?: (emoji: EmojiClickData) => void;
}

// This tells TypeScript that <emoji-picker> is a valid HTML tag.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "emoji-picker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {"data-source"?: string; locale?: string}, HTMLElement>;
    }
  }
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({onEmojiClick, ...props}) => {
  const ref = useRef<HTMLElement>(null);
  const [isReady, setIsReady] = useState(false);
  const {i18n} = useTranslation();
  const dispatch = useAppDispatch();
  const currentSkinTone = useAppSelector((state) => state.skinTone.name);

  const lang = i18n.language.split("-")[0];
  const dataSourceUrl = `/emoji-data/${lang}.json`;

  const skinToneMapping: SkinToneName[] = ["default", "light", "medium_light", "medium", "medium_dark", "dark"];
  const skinToneIndex = Math.max(0, skinToneMapping.indexOf(currentSkinTone));

  useEffect(() => {
    // Update the internal database so the picker loads the correct skin tone on initialization
    const database = new Database({dataSource: dataSourceUrl, locale: lang});
    database.setPreferredSkinTone(skinToneIndex).then(() => {
      setIsReady(true);
    });

    return () => {
      database.close();
    };
  }, [skinToneIndex, dataSourceUrl, lang]);

  useEffect(() => {
    const element = ref.current;

    if (element && lang !== "en") {
      let i18nPromise;
      if (lang === "de") {
        i18nPromise = import("emoji-picker-element/i18n/de");
      } else if (lang === "fr") {
        i18nPromise = import("emoji-picker-element/i18n/fr");
      }

      if (i18nPromise) {
        i18nPromise
          .then((module) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (element as any).i18n = module.default;
          })
          .catch(() => {
            // Fallback to English if translation is missing
          });
      }
    }

    const handleEmojiClick = (event: Event) => {
      const customEvent = event as CustomEvent<EmojiClickData>;
      if (onEmojiClick) {
        onEmojiClick(customEvent.detail);
      }
    };

    const handleSkinToneChange = (event: Event) => {
      const customEvent = event as CustomEvent<SkinToneChangeData>;
      const newSkinToneIndex = customEvent.detail.skinTone;
      const mapping: SkinToneName[] = ["default", "light", "medium_light", "medium", "medium_dark", "dark"];

      if (newSkinToneIndex >= 0 && newSkinToneIndex < mapping.length) {
        dispatch(setSkinTone(mapping[newSkinToneIndex]));
      }
    };

    if (element) {
      element.addEventListener("emoji-click", handleEmojiClick);
      element.addEventListener("skin-tone-change", handleSkinToneChange);
    }

    return () => {
      if (element) {
        element.removeEventListener("emoji-click", handleEmojiClick);
        element.removeEventListener("skin-tone-change", handleSkinToneChange);
      }
    };
  }, [onEmojiClick, dispatch, isReady, lang]);

  if (!isReady) {
    return null;
  }

  return <emoji-picker ref={ref} data-source={dataSourceUrl} locale={lang} {...props} />;
};

export default EmojiPicker;
