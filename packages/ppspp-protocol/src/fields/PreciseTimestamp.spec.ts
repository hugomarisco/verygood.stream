import { PreciseTimestamp } from "./PreciseTimestamp";

const NOW = 1002;

describe("PreciseTimestamp", () => {
  let dateNowSpy: jest.Mock;

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => NOW);
  });

  afterAll(() => {
    dateNowSpy.mockRestore();
  });

  test("should default to current time", () => {
    const field = new PreciseTimestamp();

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x07,
      0xd0
    ]);

    expect(field.encode()).toEqual(expected);
  });

  test("should encode a given timestamp", () => {
    const field = new PreciseTimestamp([1, 2000]);

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x07,
      0xd0
    ]);

    expect(field.encode()).toEqual(expected);
  });

  test("should subtract a timestamp that doesn't overflow the microseconds", () => {
    const result = new PreciseTimestamp([1, 2000]).minus(
      new PreciseTimestamp([0, 1000])
    );

    expect(result.seconds).toBe(1);
    expect(result.microseconds).toBe(1000);
  });

  test("should subtract a timestamp that overflows the microseconds", () => {
    const result = new PreciseTimestamp([1, 2000]).minus(
      new PreciseTimestamp([0, 3000])
    );

    expect(result.seconds).toBe(0);
    expect(result.microseconds).toBe(999000);
  });
});
