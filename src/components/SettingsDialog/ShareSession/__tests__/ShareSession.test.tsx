import {fireEvent, waitFor} from "@testing-library/dom";
import {render} from "@testing-library/react";
import {ShareSession} from "../ShareSession";

const renderSettingsDialog = () => render(<ShareSession />);

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
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(document.location.href);
    });

    await waitFor(() => {
      expect(button).toHaveClass("--copied");
    });
  });
});
