const WebSocket = require("ws");
const BaseTracker = require("./base");

class WebsocketTracker extends BaseTracker {
  constructor(url) {
    super(url);

    this.ws = new WebSocket(this.url.toString());

    this.ws.on("message", this._handleMessage.bind(this));
  }

  getPeers(swarmId) {
    this.ws.send({ action: "getPeers", swarmId });
  }

  _handleMessage(rawMessage) {
    try {
      const message = JSON.parse(rawMessage);

      switch (message.type) {
        case "peers":
          this.emit("peers", message.peers);
          break;
      }
    } catch (err) {
      this.emit("error", err);
    }
  }
}

module.exports = WebsocketTracker;
