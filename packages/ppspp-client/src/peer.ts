import { LiveSignatureAlgorithmCode } from "@verygood.stream/ppspp-protocol";
import BitSet from "bitset";
import EventEmitter from "events";

class Peer extends EventEmitter {
  constructor(channelId, socket, protocolOpts) {
    super();

    this.channelId = channelId;
    this.protocolOpts = protocolOpts;

    this.availability = new BitSet();

    this.protocol = new PPSPProtocol();

    socket.pipe(this.protocol).pipe(socket);

    this.protocol.on("handshake", this._onHandshake.bind(this));
    this.protocol.on("chunks", this._onChunks.bind(this));
    this.protocol.on("have", this._onHave.bind(this));
    this.protocol.on("request", this._onRequest.bind(this));
  }

  public handshake(destChannel = 0) {
    this.protocol.handshake({
      srcChannel: this.channelId,
      protocolOpts: this.protocolOpts
    });
  }

  public have({ chunkSpec }) {
    this.protocol.have({ chunkSpec });
  }

  public request({ chunkSpec }) {
    this.protocol.request({ chunkSpec });
  }

  public _onHandshake({ destChannel, srcChannel, protocolOpts }) {
    if (destChannel !== 0) { return; }

    const areValidOpts = [
      "version",
      "swarmId",
      "integrityProtectionMethod",
      "chunkAddrMethod",
      "chunkSize"
    ].every(option => protocolOpts[option] === this.protocolOpts[option]);

    if (!areValidOpts) { return; }

    this.handshake(srcChannel);
  }

  public _onChunks({
    destChannel,
    chunkSpec,
    data,
    timestamp: [seconds, microseconds]
  }) {
    if (destChannel !== this.channelId) { return; }

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

  public _onHave({ destChannel, chunkSpec }) {
    if (destChannel !== this.channelId) { return; }

    const [start, end] = chunkSpec;

    for (let i = start; i <= end; i++) {
      this.availability.set(i);
    }

    this.emit("have", { chunkSpec });
  }

  public _onRequest({ chunkSpec }) {
    this.on("request", { chunkSpec });
  }
}

module.exports = Peer;
