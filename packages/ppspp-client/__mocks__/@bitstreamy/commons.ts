export {
  SwarmMetadata,
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  // MerkleHashFunction,
  LiveSignatureAlgorithm
} from "@bitstreamy/commons/lib/SwarmMetadata"; // tslint:disable-line no-submodule-imports

export const Logger = {
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};
