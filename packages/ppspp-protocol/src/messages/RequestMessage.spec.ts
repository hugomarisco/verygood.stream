import { ChunkSpec } from "../fields/ChunkSpec";
import { RequestMessage } from "./RequestMessage";

describe("RequestMessage", () => {
  test("should encode the message", () => {
    const message = new RequestMessage(1, new ChunkSpec([2, 2]));

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x08,
      0x00,
      0x00,
      0x00,
      0x02,
      0x00,
      0x00,
      0x00,
      0x02
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
