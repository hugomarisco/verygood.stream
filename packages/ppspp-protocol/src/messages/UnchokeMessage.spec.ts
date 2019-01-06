import { UnchokeMessage } from "./UnchokeMessage";

describe("UnchokeMessage", () => {
  test("should encode the message", () => {
    const message = new UnchokeMessage(1);

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x0b,
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
