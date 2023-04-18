import {render, screen} from "@testing-library/react";
import {ToastContainer} from "react-toastify";
import {Toast, Options} from "utils/toast";

const testOptions: Options = {
  title: "Titeliger titel",
  message: "1 heftige Message mit gaanz super Buchstabän drinnnen",
  hintMessage: "wennd mogsch zeig ichs nemmer o",
  hintOnClick: jest.fn(),
  buttons: ["save", "cancel"],
  firstButtonOnClick: jest.fn(),
  secondButtonOnClick: jest.fn(),
  autoClose: false,
};

describe("Toast", () => {
  it("should render the toast", async () => {
    // arrange
    render(<ToastContainer />);
    // act
    const toastId = Toast.success(testOptions);
    // assert
    expect(toastId).toBe("1");
    expect(await screen.findByText(testOptions.title)).toBeInTheDocument();
  });
});
