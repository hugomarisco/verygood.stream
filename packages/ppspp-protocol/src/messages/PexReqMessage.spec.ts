import { PexReqMessage } from "./PexReqMessage";

describe("PexReqMessage", () => {
  test("should encode the message", () => {
    const message = new PexReqMessage(1);

    const expected = Buffer.from([0x00, 0x00, 0x00, 0x01, 0x06]);

    expect(message.encode()).toEqual(expected);
  });
});
