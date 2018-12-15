const fetch = require("node-fetch");
const BaseTracker = require("./base");

class HttpTracker extends BaseTracker {
  async getPeers(swarmId) {
    const peers = await fetch(`${this.url.origin}/swarm/${swarmId}/peers`);

    this.emit(peers);
  }
}

module.exports = HttpTracker;
