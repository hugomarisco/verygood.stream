import PPSPProtocol from "@verygood.stream/ppspp-protocol";
import async from "async";
import BitSet from "bitset";
import EventEmitter from "events";

class Swarm extends EventEmitter {
  constructor(swarmId, protocolOpts, { ChunkStore }) {
    super();

    this.swarmId = swarmId;

    this.protocolOpts = protocolOpts;

    this.chunks = [];

    this.peers = [];

    this.availability = new BitSet();
  }

  public addPeer(peer) {
    this.peers.push(peer);

    peer.on("chunk", this.chunk.bind(this));

    peer.handshake();
  }

  public chunk({ data, index }) {
    if (index > this.availability.lsb()) {
      this.chunks[index] = data;
      this.availability.set(index);
    }
  }
}

module.exports = Swarm;
