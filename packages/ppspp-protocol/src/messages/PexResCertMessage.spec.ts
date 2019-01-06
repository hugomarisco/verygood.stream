import { PexResCertMessage } from "./PexResCertMessage";

describe("PexResCertMessage", () => {
  test("should encode the message", () => {
    const message = new PexResCertMessage(1, Buffer.from([0x0a, 0x0b]));

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x0d,
      0x00,
      0x02,
      0x0a,
      0x0b
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
