const EventEmitter = require("events");
const url = require("url");
const fetch = require("node-fetch");
const WebSocket = require('ws');

class BaseTracker extends EventEmitter {
  constructor(url) {
    this.url = url.parse(url);
  }

  getPeers(swarmId) {
    switch (this.url.protocol) {
      case "http":
      case "https":
        const peers = await fetch(this.url.toString());

        this.emit(peers);
        break;
      case "ws":
      case "wss":
        if (!this.trackerWs) {
          this.trackerWs = new WebSocket(this.url.toString())

          ws.on('open', function open() {
            ws.send('something');
          });
        }


        break;
    }
  }
}

module.exports = Tracker;
