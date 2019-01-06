import { PexResV6Message } from "./PexResV6Message";

describe("PexResV6Message", () => {
  test("should encode the message", () => {
    const ipV6 = Buffer.from([
      0x0a,
      0x0b,
      0x0c,
      0x0d,
      0x0e,
      0x0f,
      0x0a,
      0x0b,
      0x0c,
      0x0d,
      0x0e,
      0x0f,
      0x0a,
      0x0b,
      0x0c,
      0x0d
    ]);

    const message = new PexResV6Message(1, ipV6, 3);

    const expected = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x01, 0x0c]),
      ipV6,
      Buffer.from([0x00, 0x03])
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
