const EventEmitter = require("events");
const url = require("url");
const fetch = require("node-fetch");

class Tracker extends EventEmitter {
  constructor(url) {
    this.url = url.parse(url);
  }

  getPeers(swarmId) {
    switch (this.url.protocol) {
      case "http":
      case "https":
        break;
      case "ws":
      case "wss":
        break;
    }
  }
}

module.exports = Tracker;
