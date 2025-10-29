import {fireEvent, waitFor} from "@testing-library/dom";
import {render} from "testUtils";
import {ShareSession} from "../ShareSession";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {I18nextProvider} from "react-i18next";
import i18nTest from "i18nTest";
import {ApplicationState} from "store";

const renderSettingsDialog = (overwrite?: Partial<ApplicationState>) =>
  render(
    <I18nextProvider i18n={i18nTest}>
      <Provider store={getTestStore(overwrite)}>
        <ShareSession />
      </Provider>
    </I18nextProvider>
  );

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

describe("ShareQrCode Tests", () => {
  test("render ShareQrCode correctly", () => {
    const shareDialog = renderSettingsDialog();
    expect(shareDialog).toMatchSnapshot();
  });

  test("Click on copy share link", async () => {
    const shareDialog = renderSettingsDialog();
    jest.spyOn(navigator.clipboard, "writeText");

    const button = shareDialog.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("http://localhost/board/test-board-id");
    });

    await waitFor(() => {
      expect(button).toHaveClass("--copied");
    });
  });

  test("should render password hint (with link) if access policy is passphrase", () => {
    const shareDialog = renderSettingsDialog({
      board: {
        data: {
          accessPolicy: "BY_PASSPHRASE",
          id: "",
          showAuthors: false,
          showNotesOfOtherUsers: false,
          showNoteReactions: false,
          allowStacking: false,
          isLocked: false,
        },
        status: "pending",
      },
    });

    // const hintElement = await shareDialog.findByTestId("share-session-hint");
    const hintElement = shareDialog.getByRole("link");

    expect(hintElement).toBeVisible();
  });
});
