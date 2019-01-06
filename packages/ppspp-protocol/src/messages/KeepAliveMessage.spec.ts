import { KeepAliveMessage } from "./KeepAliveMessage";

describe("KeepAliveMessage", () => {
  test("should encode the message", () => {
    const message = new KeepAliveMessage(1);

    const expected = Buffer.from([0x00, 0x00, 0x00, 0x01]);

    expect(message.encode()).toEqual(expected);
  });
});
