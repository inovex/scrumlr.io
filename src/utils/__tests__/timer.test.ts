import {Timer} from "utils/timer";

describe("Timer", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2022, 0, 1, 13, 0, 0));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("calculateTimeLeft", () => {
    it("should return the correct time left", () => {
      console.log(new Date());
      const endTime = new Date(2022, 0, 1, 14, 5, 10);
      const timeLeft = Timer.calculateTimeLeft(endTime);
      expect(timeLeft).toEqual({h: 1, m: 5, s: 10});
    });
  });

  describe("calculateElapsedTimePercentage", () => {
    it("should return the correct elapsed time percentage", () => {
      const startTime = new Date(2022, 0, 1, 10, 0, 0);
      const endTime = new Date(2022, 0, 1, 14, 0, 0);
      const elapsedTimePercentage = Timer.calculateElapsedTimePercentage(startTime, endTime);
      expect(elapsedTimePercentage).toBe(0.25);
    });
  });

  describe("addOffsetToDate", () => {
    it("should add the offset to the date", () => {
      const date = new Date(2020, 0, 1, 12, 0, 0);
      const offset = 3600000; // 1 hour in milliseconds
      const newDate = Timer.addOffsetToDate(date, offset);
      expect(newDate).toEqual(new Date(2020, 0, 1, 13, 0, 0));
    });

    it("should return undefined if the input date is undefined", () => {
      const newDate = Timer.addOffsetToDate(undefined, 0);
      expect(newDate).toBeUndefined();
    });
  });

  describe("removeOffsetFromDate", () => {
    it("should remove the offset from the date", () => {
      const date = new Date(2020, 0, 1, 12, 0, 0);
      const offset = 3600000; // 1 hour in milliseconds
      const newDate = Timer.removeOffsetFromDate(date, offset);
      expect(newDate).toEqual(new Date(2020, 0, 1, 11, 0, 0));
    });

    it("should return undefined if the input date is undefined", () => {
      const newDate = Timer.removeOffsetFromDate(undefined, 0);
      expect(newDate).toBeUndefined();
    });
  });
});
