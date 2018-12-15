import EventEmitter from "events";
import Swarm from "./swarm";

class Client extends EventEmitter {
  constructor() {
    super();

    this.swarms = {};

    this.channelIds = [];
  }

  public _generateChannelId() {
    let randomId;

    do {
      randomId = Math.floor(Math.random() * 0xffffffff);
    } while (this.channelIds.indexOf(randomId) < 0);

    return randomId;
  }

  public addSwarm(swarmId: Buffer, protocolOpts) {
    const swarm = new Swarm(swarmId, protocolOpts);

    this.swarms[swarmId] = swarm;

    swarm.on("chunk", this._onChunk.bind(this, swarmId));

    this.trackers.forEach(async tracker => {
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

  public removeSwarm(swarmId) {
    const swarm = this.swarms[swarmId];

    swarm.destroy();

    delete this.swarms[swarmId];
  }

  public _onChunk(swarmId, data) {
    this.emit("chunk", { swarmId, data });
  }
}

module.exports = Client;
