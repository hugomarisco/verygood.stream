import { AckMessage } from "../messages/AckMessage";
import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  ProtocolOptions
} from "./ProtocolOptions";

describe("ProtocolOptions", () => {
  test("should encode if all options are provided", () => {
    const swarmId = Buffer.from([0x0a, 0x0b]);

    const field = new ProtocolOptions(
      1,
      ContentIntegrityProtectionMethod.NONE,
      ChunkAddressingMethod["32ChunkRanges"],
      2,
      3,
      [AckMessage.CODE],
      1,
      swarmId
    );

    const expected = Buffer.concat([
      Buffer.from([0x00, 0x01, 0x01, 0x01, 0x02, 0x00, 0x02]),
      swarmId,
      Buffer.from([
        0x03,
        ContentIntegrityProtectionMethod.NONE,
        0x06,
        ChunkAddressingMethod["32ChunkRanges"],
        0x07,
        0x00,
        0x00,
        0x00,
        0x02,
        0x08,
        0x01,
        0x04,
        0x09,
        0x00,
        0x00,
        0x00,
        0x03,
        0xff
      ])
    ]);

    expect(field.encode()).toEqual(expected);
  });
});
