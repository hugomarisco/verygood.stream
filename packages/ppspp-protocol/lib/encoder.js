const { OPTION_CODES } = require("./constants");

module.exports = {
  protocolOptions(obj) {
    const buffers = [];
    let buf;

    Object.keys(obj).forEach(option => {
      const code = OPTION_CODES[option];
      const value = obj[option];

      if (code === undefined) return;

      buffers.push(Buffer.from([code]));

      switch (option) {
        case "version":
        case "minVersion":
        case "integrityProtectionMethod":
        case "merkleFunc":
        case "liveSigAlgo":
        case "chunkAddrMethod":
          buffers.push(Buffer.from([value]));
          break;

        case "liveDiscardWindow":
        case "chunkSize":
          buf = Buffer.alloc(4);

          buf.writeUInt32BE(value);

          buffers.push(buf);
          break;

        case "swarmId":
          const swarmId = Buffer.from(value, "base64");

          buf = Buffer.alloc(2);
          buf.writeUInt16BE(swarmId.length);
          buffers.push(buf);

          buffers.push(swarmId);
          break;

        case "supportedMsgs":
          const bitmap = Object.keys(MESSAGE_TYPES).map(
            type => protocolOpts.supportedMsgs[type] === true
          );

          const byteLength = Math.ceil(bitmap.length / 8.0);

          buffers.push(Buffer.from(byteLength));

          for (let i = 0; i < byteLength; i++) {
            const byte = bitmap
              .slice(8 * i, 8 * i + 8)
              .reduce(
                (byte, flag, index) =>
                  byte + (flag ? Math.pow(2, 7 - index) : 0),
                0
              );

            buffers.push(Buffer.from([byte]));
          }
          break;
      }
    });

    buffers.push(Buffer.from([OPTION_CODES.end]));

    return Buffer.concat(buffers);
  },

  chunkSpec(values) {
    const buf = Buffer.alloc(values.length * 4);

    values.forEach((v, i) => buf.writeUInt32BE(v, i * 4));

    return buf;
  }
};
