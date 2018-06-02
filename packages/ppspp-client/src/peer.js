const EventEmitter = require("events");
const BitSet = require("bitset");
const PPSPProtocol = require("../../ppspp-protocol");

class Peer extends EventEmitter {
  constructor(channelId, socket, protocolOpts) {
    super();

    this.channelId = channelId;
    this.protocolOpts = protocolOpts;

    this.availability = new BitSet();

    this.protocol = new PPSPProtocol();

    socket.pipe(this.protocol).pipe(socket);

    this.protocol.on("handshake", this.onHandshake.bind(this));
    this.protocol.on("chunks", this.onChunks.bind(this));
    this.protocol.on("have", this.onHave.bind(this));
    this.protocol.on("request", this.onRequest.bind(this));
  }

  handshake(destChannel = 0) {
    this.protocol.handshake({
      srcChannel: this.channelId,
      protocolOpts: this.protocolOpts
    });
  }

  have({ chunkSpec }) {
    this.protocol.have({ chunkSpec });
  }

  request({ chunkSpec }) {
    this.protocol.request({ chunkSpec });
  }

  _onHandshake({ destChannel, srcChannel, protocolOpts }) {
    if (destChannel !== 0) return;

    const areValidOpts = [
      "version",
      "swarmId",
      "integrityProtectionMethod",
      "chunkAddrMethod",
      "chunkSize"
    ].every(option => protocolOpts[option] === this.protocolOpts[option]);

    if (!areValidOpts) return;

    this.handshake(srcChannel);
  }

  _onChunks({
    destChannel,
    chunkSpec,
    data,
    timestamp: [seconds, microseconds]
  }) {
    if (destChannel !== this.channelId) return;

    const delay = process.hrtime([seconds, microseconds * 1000]);

    this.protocol.ack({ chunkSpec, delay });

    const [start, end] = chunksSpec;
    const chunkSize = this.protocolOpts.chunkSize;

    for (let i = start; i <= end; i++) {
      this.emit("chunk", {
        index: i,
        data: data.slice(
          (i - start) * chunkSize,
          (i - start) * chunkSize + chunkSize
        )
      });
    }
  }

  _onHave({ destChannel, chunkSpec }) {
    if (destChannel !== this.channelId) return;

    const [start, end] = chunkSpec;

    for (let i = start; i <= end; i++) {
      this.availability.set(i);
    }

    this.emit("have", { chunkSpec });
  }

  _onRequest({ chunkSpec }) {
    this.on("request", { chunkSpec });
  }
}

module.exports = Peer;
