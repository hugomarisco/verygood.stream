import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  LiveSignatureAlgorithm,
  SwarmMetadata
} from "./SwarmMetadata";

const swarmId = Buffer.from("abc");

describe("SwarmMetadata", () => {
  test("should correctly initialize", () => {
    // tslint:disable-next-line:no-unused-expression
    new SwarmMetadata(
      swarmId,
      10,
      ChunkAddressingMethod["32ChunkRanges"],
      ContentIntegrityProtectionMethod.NONE
    );

    // tslint:disable-next-line:no-unused-expression
    new SwarmMetadata(
      swarmId,
      10,
      ChunkAddressingMethod["32ChunkRanges"],
      ContentIntegrityProtectionMethod.SIGN_ALL,
      LiveSignatureAlgorithm.RSASHA256
    );

    // tslint:disable-next-line:no-unused-expression
    new SwarmMetadata(
      swarmId,
      10,
      ChunkAddressingMethod["32ChunkRanges"],
      ContentIntegrityProtectionMethod.SIGN_ALL,
      LiveSignatureAlgorithm.RSASHA1
    );
  });

  test("should throw if ContentIntegrityProtectionMethod === SIGN_ALL and there is no liveSignatureAlgorithm", () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-expression
      new SwarmMetadata(
        swarmId,
        10,
        ChunkAddressingMethod["32ChunkRanges"],
        ContentIntegrityProtectionMethod.SIGN_ALL
      );
    }).toThrowError(
      new Error(
        "The live signature algorithm is required when content integrity protection method is sign-all"
      )
    );
  });
});
