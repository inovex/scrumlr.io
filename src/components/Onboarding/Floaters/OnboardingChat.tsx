import {onboardingAuthors} from "types/onboardingNotes";
import {UserAvatar} from "components/BoardUsers";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import onboardingChats from "../onboardingDialogue.en.json";
import "./OnboardingModal.scss";
import "./OnboardingChat.scss";

type OnboardingChatProps = {
  chatName: string;
  title: string;
};

export const OnboardingChat = (props: OnboardingChatProps) => {
  const dispatch = useDispatch();

  const generateUserAvatar = (name?: string): JSX.Element => {
    const author = onboardingAuthors.find((oa) => oa.user.name === name);
    if (!author) {
      return <div />;
    }
    return <UserAvatar id={author.user.id} title={author.user.name} avatar={author.user.avatar} />;
  };

  return (
    <div className="floater onboarding-modal">
      <button className="onboarding-modal__close" onClick={() => dispatch(Actions.toggleStepOpen())}>
        <CloseIcon className="close-button__icon" />
      </button>
      <ul className="onboarding-chat__list">
        {onboardingChats[props.chatName].map((chat: {author?: string; text: string; color: string}) => (
          <li className="onboarding-chat__item">
            <div className="onboarding-chat__author">
              {generateUserAvatar(chat.author)}
              <div>{chat.author}</div>
            </div>
            <div className={`onboarding-chat__text ${chat.color}`}>{chat.text}</div>
          </li>
        ))}
      </ul>
      <div className="onboarding-chat__title">
        <h2>{props.title}</h2>
      </div>
    </div>
  );
};
