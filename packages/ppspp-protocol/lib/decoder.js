const {
  MERKLE_HASH_FUNCS,
  SIG_ALGOS,
  OPTION_CODES,
  CHUNK_ADDR_METHODS
} = require("./constants");

module.exports = {
  protocolOptions(buf) {
    const decoded = {};

    let length = 0;
    let code;

    do {
      code = buf.readUInt8(length);
      length += 1;

      switch (code) {
        case OPTION_CODES.version:
          decoded.version = buf.readUInt8(length);
          length += 1;
          break;
        case OPTION_CODES.minVersion:
          decoded.minVersion = buf.readUInt8(length);
          length += 1;
          break;
        case OPTION_CODES.swarmId:
          const swarmIdLength = buf.readUInt16BE(length);
          length += 2;

          decoded.swarmId = buf
            .slice(length, length + swarmIdLength)
            .toString('base64');

          length += swarmIdLength;
          break;
        case OPTION_CODES.integrityProtectionMethod:
          decoded.integrityProtectionMethod = buf.readUInt8(length);
          length += 1;
          break;
        case OPTION_CODES.merkleFunc:
          decoded.merkleFunc = buf.readUInt8(length);
          length += 1;
          break;
        case OPTION_CODES.liveSigAlgo:
          decoded.liveSigAlgo = buf.readUInt8(length);
          length += 1;
          break;
        case OPTION_CODES.chunkAddrMethod:
          decoded.chunkAddrMethod = buf.readUInt8(length);
          length += 1;
          break;
        case OPTION_CODES.liveDiscardWindow:
          decoded.liveDiscardWindow = buf.readUInt32BE(length);
          length += 4;

          break;
        case OPTION_CODES.supportedMsgs:
          const supportedMsgsLength = buf.readUInt8(length);
          length += 1;

          const supportedMsgsBits = buf
            .slice(length, length + supportedMsgsLength)
            .reduce((bits, byte, length) => [...bits, ...byte.toString(2)], []);

          decoded.supportedMsgs = Object.keys(MESSAGE_TYPES).reduce(
            (supportedMsgs, type) => {
              const typeCode = MESSAGE_TYPES[type];

              return {
                ...supportedMsgs,
                [type]: supportedMsgsBits[typeCode] === "1"
              };
            },
            {}
          );

          length += supportedMsgsLength;
          break;
        case OPTION_CODES.chunkSize:
          decoded.chunkSize = buf.readUInt32BE(length);
          length += 4;
          break;
        case OPTION_CODES.end:
          break;
      }
    } while (code !== OPTION_CODES.end);

    return { length, decoded };
  },

  chunkSpec(buf, { chunkAddrMethod }) {
    const decoded = [];

    let length = 0;

    switch (chunkAddrMethod) {
      case CHUNK_ADDR_METHODS["32BINs"]:
        decoded.push(buf.readUInt32BE(length));
        length += 4;
        break;
      case CHUNK_ADDR_METHODS["32ChunkRanges"]:
        decoded.push(buf.readUInt32BE(length));
        decoded.push(buf.readUInt32BE(length + 4));
        length += 8;
        break;
    }

    return { length, decoded };
  },

  timestamp(buf) {
    return {
      length: 8,
      decoded: [buf.readUInt32BE(0), buf.readUInt32BE(4)]
    };
  },

  hash(buf, { hashFunc }) {
    const bytes = {
      [MERKLE_HASH_FUNCS.SHA1]: 20,
      [MERKLE_HASH_FUNCS.SHA224]: 28,
      [MERKLE_HASH_FUNCS.SHA256]: 32,
      [MERKLE_HASH_FUNCS.SHA384]: 48,
      [MERKLE_HASH_FUNCS.SHA512]: 64
    }[hashFunc];

    return { length: bytes, decoded: buf.slice(0, bytes).toString('hex') };
  },

  signature(buf, { swarmId }) {
    let bytes;

    const swarmIdBuf = Buffer.from(swarmId, 'base64');

    const sigAlgo = swarmIdBuf.readUInt8(0);

    switch (sigAlgo) {
      case SIG_ALGOS.RSASHA1:
      case SIG_ALGOS.RSASHA256:
        bytes = swarmIdBuf.readUInt8(1);

        if (bytes === 0) bytes = swarmIdBuf.readUInt32BE(2);
        break;
      case SIG_ALGOS.ECDSAP256SHA256:
        bytes = 64;
        break;
      case SIG_ALGOS.ECDSAP384SHA384:
        bytes = 96;
        break;
    }

    return { length: bytes, decoded: buf.slice(0, bytes).toString('base64') };
  }
};
