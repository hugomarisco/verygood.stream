import { EventEmitter } from "events";
import { IncomingMessage } from "http";
import URL from "url";
import WebSocket from "ws";
import { Logger } from "./Logger";
import { Peer } from "./Peer";
import { Swarm } from "./Swarm";

export default class Tracker extends EventEmitter {
  private wss: WebSocket.Server;
  private swarms: {
    [swarmId: string]: Swarm;
  };

  constructor(port: number) {
    super();

    this.swarms = {};

    this.wss = new WebSocket.Server({
      clientTracking: false,
      maxPayload: 5 * 1024,
      port
    });

    this.wss.on("listening", this.emit.bind(this, "listening"));
    this.wss.on("close", this.emit.bind(this, "close"));
    this.wss.on("error", this.emit.bind(this, "error"));

    this.wss.on("connection", this.onConnection.bind(this));
  }

  private onConnection(ws: WebSocket, request: IncomingMessage) {
    if (!request.url) {
      Logger.warn("Invalid request received");

      return;
    }

    const swarmId = URL.parse(request.url).pathname;

    if (!swarmId) {
      Logger.warn("Empty swarmId in the request", {
        url: request.url
      });

      return;
    }

    if (!this.swarms[swarmId]) {
      this.swarms[swarmId] = new Swarm(swarmId);
    }

    const swarm = this.swarms[swarmId];
    const peer = new Peer(ws);

    swarm.addPeer(peer);

    Logger.info(`New peer connection`, {
      peerId: peer.peerId
    });
  }
}
