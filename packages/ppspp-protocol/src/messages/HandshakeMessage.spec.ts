import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  ProtocolOptions
} from "../fields/ProtocolOptions";
import { HandshakeMessage } from "./HandshakeMessage";

describe("HandshakeMessage", () => {
  let protocolOptions: ProtocolOptions;

  beforeAll(() => {
    protocolOptions = new ProtocolOptions(
      1,
      ContentIntegrityProtectionMethod.NONE,
      ChunkAddressingMethod["32ChunkRanges"],
      1,
      1,
      []
    );
  });

  test("should default the destination channel to 0", () => {
    const message = new HandshakeMessage(2, protocolOptions);

    const expected = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02]),
      protocolOptions.encode()
    ]);

    expect(message.encode()).toEqual(expected);
  });

  test("should encode the message", () => {
    const message = new HandshakeMessage(2, protocolOptions, 1);

    const expected = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x02]),
      protocolOptions.encode()
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
