const async = require("async");
const PPSPProtocol = require("@verygood.stream/ppspp-protocol");
const BitSet = require("bitset");
const EventEmitter = require("events");

class Swarm extends EventEmitter {
  constructor(swarmId, protocolOpts, { ChunkStore }) {
    super();

    this.swarmId = swarmId;

    this.protocolOpts = protocolOpts;

    this.store = new ChunkStore(this.protocolOpts.chunkSize);

    this.peers = [];

    this.availability = new BitSet();
  }

  addPeer(peer) {
    this.peers.push(peer);

    peer.on("chunk", this.chunk.bind(this));

    peer.handshake();
  }

  chunk({ data, index }) {
    if (index > this.availability.lsb()) {
      this.store.put(index, data, err => {
        this.availability.set(index);

        this.emit("chunk", { data, index });
      });
    }
  }
}

module.exports = Swarm;
