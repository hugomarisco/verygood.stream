const Swarm = require("./src/swarm");
const EventEmitter = require("events");

class Client extends EventEmitter {
  constructor({ ChunkStore, trackers = [] }) {
    super();

    this.ChunkStore = ChunkStore;

    this.trackers = trackers;

    this.swarms = {};

    this.channelIds = [];
  }

  _generateChannelId() {
    let randomId;

    do {
      randomId = Math.floor(Math.random() * 0xffffffff);
    } while (this.channelIds.indexOf(randomId) < 0);

    return randomId;
  }

  addSwarm(swarmId, protocolOpts) {
    const swarm = new Swarm(swarmId, protocolOpts, {
      ChunkStore: this.ChunkStore
    });

    this.swarms[swarmId] = swarm;

    swarm.on("chunk", this._onChunk.bind(this, swarmId));

    const peers = this.trackers.forEach(async tracker => {
      const peersMetadata = await tracker.getPeers(swarmId);

      peersMetadata.forEach(peerMetadata => {
        const channelId = this._generateChannelId();

        this.channelIds.push(channelId);

        const peer = new Peer(channelId, peerMetadata);

        swarm.addPeer(peer);
      });
    });

    return swarm;
  }

  removeSwarm(swarmId) {
    const swarm = this.swarms[swarmId];

    swarm.destroy();

    delete this.swarms[swarmId];
  }

  _onChunk(swarmId, data) {
    this.emit("chunk", { swarmId, data });
  }
}

module.exports = Client;
