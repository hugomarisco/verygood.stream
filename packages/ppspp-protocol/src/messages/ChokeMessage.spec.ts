import { ChokeMessage } from "./ChokeMessage";

describe("ChokeMessage", () => {
  test("should encode the message", () => {
    const message = new ChokeMessage(1);

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x0a,
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
