const { Duplex } = require("stream");
const { MESSAGE_TYPES } = require("./lib/constants");
const decoder = require("./lib/decoder");
const encoder = require("./lib/encoder");

class PPSPPProtocol extends Duplex {
  constructor() {
    super();

    this._protocolOpts = {};

    this._destChannelBuf = Buffer.alloc(4);
  }

  _read(size) {}

  handshake({ destChannel = 0, srcChannel, protocolOptions }) {
    const codeBuf = Buffer.from([MESSAGE_TYPES.HANDSHAKE]);

    this._destChannelBuf.writeUInt32BE(destChannel);

    const srcChannelBuf = Buffer.alloc(4);
    srcChannelBuf.writeUInt32BE(srcChannel);

    const protocolOptionsBuf = encoder.protocolOptions(protocolOptions);

    const buf = Buffer.concat([codeBuf, srcChannelBuf, protocolOptionsBuf]);

    this.push(buf);
  }

  have({ chunkSpec }) {
    const buf = Buffer.concat([
      Buffer.from([MESSAGE_TYPES.HAVE]),
      encoder.chunkSpec(chunkSpec)
    ]);

    this.push(buf);
  }

  chunk({ chunkSpec, data, timestamp: [seconds, microseconds] }) {
    const codeBuf = Buffer.from([MESSAGE_TYPES.DATA]);

    const chunkSpecBuf = encoder.chunkSpec(chunkSpec);

    const timestampBuf = Buffer.alloc(8);

    timestampBuf.writeUInt32BE(seconds);
    timestampBuf.writeUInt32BE(microseconds, 4);

    const buf = Buffer.concat([codeBuf, chunkSpecBuf, timestampBuf, data]);

    this.push(buf);
  }

  ack({ chunkSpec, delay: [seconds, microseconds] }) {
    const codeBuf = Buffer.from([MESSAGE_TYPES.ACK]);

    const chunkSpecBuf = encoder.chunkSpec(chunkSpec);

    const delayBuf = Buffer.alloc(8);

    delayBuf.writeUInt32BE(seconds);
    delayBuf.writeUInt32BE(microseconds, 4);

    const buf = Buffer.concat([codeBuf, chunkSpecBuf, delayBuf]);

    this.push(buf);
  }

  integrity({ chunkSpec, hash }) {
    const codeBuf = Buffer.from([MESSAGE_TYPES.INTEGRITY]);

    const chunkSpecBuf = encoder.chunkSpec(chunkSpec);

    const hashBuf = Buffer.from(hash, "hex");

    const buf = Buffer.concat([codeBuf, chunkSpecBuf, hashBuf]);

    this.push(buf);
  }

  signedIntegrity({
    chunkSpec,
    timestamp: [seconds, microseconds],
    signature
  }) {
    const codeBuf = Buffer.from([MESSAGE_TYPES.SIGNED_INTEGRITY]);

    const chunkSpecBuf = encoder.chunkSpec(chunkSpec);

    const timestampBuf = Buffer.alloc(8);

    timestampBuf.writeUInt32BE(seconds);
    timestampBuf.writeUInt32BE(microseconds, 4);

    const signatureBuf = Buffer.from(signature, "base64");

    const buf = Buffer.concat([
      codeBuf,
      chunkSpecBuf,
      timestampBuf,
      signatureBuf
    ]);

    this.push(buf);
  }

  request({ chunkSpec }) {
    const buf = Buffer.concat([
      Buffer.from([MESSAGE_TYPES.REQUEST]),
      encoder.chunkSpec(chunkSpec)
    ]);

    this.push(buf);
  }

  cancel({ chunkSpec }) {
    const buf = Buffer.concat([
      Buffer.from([MESSAGE_TYPES.CANCEL]),
      encoder.chunkSpec(chunkSpec)
    ]);

    this.push(buf);
  }

  choke() {
    this.push(Buffer.from([MESSAGE_TYPES.CHOKE]));
  }

  unchoke() {
    this.push(Buffer.from([MESSAGE_TYPES.UNCHOKE]));
  }

  pexReq() {
    this.push(Buffer.from([MESSAGE_TYPES.PEX_REQ]));
  }

  pexResV4({ ip, port }) {
    const codeBuf = Buffer.from([MESSAGE_TYPES.PEX_RESv4]);

    const portBuf = Buffer.alloc(2);
    portBuf.writeUInt16BE(port);

    const buf = Buffer.concat([codeBuf, ip, portBuf]);

    this.push(buf);
  }

  pexResV6({ ip, port }) {
    const codeBuf = Buffer.from([MESSAGE_TYPES.PEX_RESv6]);

    const portBuf = Buffer.alloc(2);
    portBuf.writeUInt16BE(port);

    const buf = Buffer.concat([codeBuf, ip, portBuf]);

    this.push(buf);
  }

  pexResCert({ cert }) {
    const codeBuf = Buffer.from([MESSAGE_TYPES.PEX_REScer]);

    const certLengthBuf = Buffer.alloc(2);

    certLengthBuf.writeUInt16BE(cert.length);

    const buf = Buffer.concat([codeBuf, certLengthBuf, cert]);

    this.push(buf);
  }

  keepalive() {
    this.push(Buffer.from([]));
  }

  push(message, encoding) {
    const buf = Buffer.concat([this._destChannelBuf, message]);

    super.push(buf, encoding);
  }

  _write(datagram, encoding, cb) {
    try {
      let index = 0;

      do {
        index = this._processMessage(datagram.slice(index));
      } while (index < datagram.length);
    } catch (err) {
      cb(err);
    }

    cb();
  }

  _processMessage(buf) {
    let index = 0;

    const destChannel = buf.readUInt32BE(index);
    index += 4;

    const decoded = { destChannel };

    if (buf.length === index) {
      this.emit("keepalive", decoded);
      return index;
    }

    const messageCode = buf.readUInt8(index);
    index += 1;

    switch (messageCode) {
      case MESSAGE_TYPES.HANDSHAKE:
        const srcChannel = buf.readUInt32BE(index);
        index += 4;

        const {
          length: protocolOptionsLength,
          decoded: protocolOptions
        } = decoder.protocolOptions(buf.slice(index));

        index += protocolOptionsLength;

        this.emit("handshake", { ...decoded, srcChannel, protocolOptions });

        this._protocolOptions = protocolOptions;

        break;
      case MESSAGE_TYPES.DATA:
        const {
          length: dataChunkSpecLength,
          decoded: dataChunkSpec
        } = decoder.chunkSpec(buf.slice(index), {
          chunkAddrMethod: this._protocolOptions.chunkAddrMethod
        });

        index += dataChunkSpecLength;

        const {
          length: dataTimestampLength,
          decoded: dataTimestamp
        } = decoder.timestamp(buf.slice(index));

        index += dataTimestampLength;

        const data = buf.slice(index, index + this._protocolOptions.chunkSize);

        index += this._protocolOptions.chunkSize;

        this.emit("chunk", {
          ...decoded,
          chunkSpec: dataChunkSpec,
          timestamp: dataTimestamp,
          data
        });

        break;
      case MESSAGE_TYPES.ACK:
        const {
          length: ackChunkSpecLength,
          decoded: ackChunkSpec
        } = decoder.chunkSpec(buf.slice(index), {
          chunkAddrMethod: this._protocolOptions.chunkAddrMethod
        });

        index += ackChunkSpecLength;

        const { length: ackDelayLength, decoded: ackDelay } = decoder.timestamp(
          buf.slice(index)
        );

        index += ackDelayLength;

        this.emit("ack", {
          ...decoded,
          chunkSpec: ackChunkSpec,
          delay: ackDelay
        });

        break;
      case MESSAGE_TYPES.HAVE:
        const {
          length: haveChunkSpecLength,
          decoded: haveChunkSpec
        } = decoder.chunkSpec(buf.slice(index), {
          chunkAddrMethod: this._protocolOptions.chunkAddrMethod
        });

        index += haveChunkSpecLength;

        this.emit("have", { ...decoded, chunkSpec: haveChunkSpec });

        break;
      case MESSAGE_TYPES.INTEGRITY:
        const {
          length: integrityChunkSpecLength,
          decoded: integrityChunkSpec
        } = decoder.chunkSpec(buf.slice(index), {
          chunkAddrMethod: this._protocolOptions.chunkAddrMethod
        });

        index += integrityChunkSpecLength;

        const { length: hashLength, decoded: hash } = decoder.hash(
          buf.slice(index),
          {
            hashFunc: this._protocolOptions.merkleFunc
          }
        );

        index += hashLength;

        this.emit("integrity", {
          ...decoded,
          chunkSpec: integrityChunkSpec,
          hash
        });

        break;
      case MESSAGE_TYPES.PEX_RESv4:
        const pexResV4Ip = buf.slice(index, index + 4);
        index += 4;

        const pexResV4Port = buf.readUInt16BE(index);
        index += 2;

        this.emit("pexResV4", {
          ...decoded,
          ip: pexResV4Ip,
          port: pexResV4Port
        });
        break;
      case MESSAGE_TYPES.PEX_REQ:
        this.emit("pexReq", decoded);
        break;
      case MESSAGE_TYPES.SIGNED_INTEGRITY:
        const {
          length: signedIntegrityChunkSpecLength,
          decoded: signedIntegrityChunkSpec
        } = decoder.chunkSpec(buf.slice(index), {
          chunkAddrMethod: this._protocolOptions.chunkAddrMethod
        });

        index += signedIntegrityChunkSpecLength;

        const {
          length: signedIntegrityTimestampLength,
          decoded: signedIntegrityTimestamp
        } = decoder.timestamp(buf.slice(index));

        index += signedIntegrityTimestampLength;

        const {
          length: signatureLength,
          decoded: signature
        } = decoder.signature(buf.slice(index), {
          swarmId: this._protocolOptions.swarmId
        });

        index += signatureLength;

        this.emit("signedIntegrity", {
          ...decoded,
          chunkSpec: signedIntegrityChunkSpec,
          timestamp: signedIntegrityTimestamp,
          signature
        });

        break;
      case MESSAGE_TYPES.REQUEST:
        const {
          length: requestChunkSpecLength,
          decoded: requestChunkSpec
        } = decoder.chunkSpec(buf.slice(index), {
          chunkAddrMethod: this._protocolOptions.chunkAddrMethod
        });

        index += requestChunkSpecLength;

        this.emit("request", { ...decoded, chunkSpec: requestChunkSpec });

        break;
      case MESSAGE_TYPES.CANCEL:
        const {
          length: cancelChunkSpecLength,
          decoded: cancelChunkSpec
        } = decoder.chunkSpec(buf.slice(index), {
          chunkAddrMethod: this._protocolOptions.chunkAddrMethod
        });

        index += cancelChunkSpecLength;

        this.emit("cancel", { ...decoded, chunkSpec: cancelChunkSpec });

        break;
      case MESSAGE_TYPES.CHOKE:
        this.emit("choke", decoded);
        break;
      case MESSAGE_TYPES.UNCHOKE:
        this.emit("unchoke", decoded);
        break;
      case MESSAGE_TYPES.PEX_RESv6:
        const pexResV6Ip = buf.slice(index, index + 16);
        index += 16;

        const pexResV6Port = buf.readUInt16BE(index);
        index += 2;

        this.emit("pexResV6", {
          ...decoded,
          ip: pexResV6Ip,
          port: pexResV6Port
        });
        break;
      case MESSAGE_TYPES.PEX_REScer:
        const certLength = buf.readUInt16BE(index);
        index += 2;

        const certificate = buf.slice(index, index + certLength);
        index += certLength;

        this.emit("pexResCer", { ...decoded, certificate });

        break;
      default:
        this.emit("keepalive", decoded);
    }

    return index;
  }
}

module.exports = PPSPPProtocol;
