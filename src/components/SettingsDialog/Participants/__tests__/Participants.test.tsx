import {within} from "@testing-library/react";
import {t} from "i18next";
import {Provider} from "react-redux";
import {MockStoreEnhanced} from "redux-mock-store";
import {render} from "testUtils";
import {ApplicationState} from "types";
import getTestStore from "utils/test/getTestStore";
import {Participants} from "../Participants";

const createParticipants = (store: MockStoreEnhanced<ApplicationState>) => (
  <Provider store={store}>
    <Participants />
  </Provider>
);

describe("Participants", () => {
  test("should render filter and participants correctly", () => {
    const {container} = render(createParticipants(getTestStore()));
    expect(container.firstChild).toMatchSnapshot();
  });

  describe("Ban Feature", () => {
    test("ban button not available on self", () => {
      const {container} = render(createParticipants(getTestStore()));
      const participants = container.getElementsByClassName("participants__list-item");
      expect(within(participants[0]).queryByLabelText(t("Participants.BanParticipantTooltip"))).not.toBeInTheDocument();
    });

    test("ban button available on moderator", () => {
      const {container} = render(createParticipants(getTestStore()));
      const participants = container.getElementsByClassName("participants__list-item");
      expect(within(participants[1]).getByLabelText(t("Participants.BanParticipantTooltip"))).toBeInTheDocument();
    });
  });
});
