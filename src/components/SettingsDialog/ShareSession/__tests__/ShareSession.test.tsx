import {fireEvent, waitFor} from "@testing-library/dom";
import {render} from "@testing-library/react";
import {ShareSession} from "../ShareSession";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {I18nextProvider} from "react-i18next";
import i18nTest from "i18nTest";

const renderSettingsDialog = () =>
  render(
    <I18nextProvider i18n={i18nTest}>
      <Provider store={getTestStore()}>
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
  });
});
