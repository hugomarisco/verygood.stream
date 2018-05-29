module.exports = {
  MESSAGE_TYPES: {
    HANDSHAKE: 0x00,
    DATA: 0x01,
    ACK: 0x02,
    HAVE: 0x03,
    INTEGRITY: 0x04,
    PEX_RESv4: 0x05,
    PEX_REQ: 0x06,
    SIGNED_INTEGRITY: 0x07,
    REQUEST: 0x08,
    CANCEL: 0x09,
    CHOKE: 0x0a,
    UNCHOKE: 0x0b,
    PEX_RESv6: 0x0c,
    PEX_REScer: 0x0d
  },
  OPTION_CODES: {
    version: 0,
    minVersion: 1,
    swarmId: 2,
    integrityProtectionMethod: 3,
    merkleFunc: 4,
    liveSigAlgo: 5,
    chunkAddrMethod: 6,
    liveDiscardWindow: 7,
    supportedMsgs: 8,
    chunkSize: 9,
    end: 255
  },
  CHUNK_ADDR_METHODS: {
    "32BINs": 0,
    //"64ByteRanges": 1,
    "32ChunkRanges": 2
    //"64BINs": 3,
    //"64ChunkRanges": 4
  },
  MERKLE_HASH_FUNCS: {
    SHA1: 0,
    SHA224: 1,
    SHA256: 2,
    SHA384: 3,
    SHA512: 4
  },
  SIG_ALGOS: {
    RSASHA1: 5,
    RSASHA256: 8,
    ECDSAP256SHA256: 13,
    ECDSAP384SHA384: 14
  }
};
