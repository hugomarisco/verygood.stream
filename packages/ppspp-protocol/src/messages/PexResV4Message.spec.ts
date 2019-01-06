import { PexResV4Message } from "./PexResV4Message";

describe("PexResV4Message", () => {
  test("should encode the message", () => {
    const message = new PexResV4Message(1, 2, 3);

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x05,
      0x00,
      0x00,
      0x00,
      0x02,
      0x00,
      0x03
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
