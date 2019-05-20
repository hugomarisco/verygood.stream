import { EventEmitter } from "events";
import { createServer, IncomingMessage } from "http";
import URL from "url";
import WebSocket from "ws";
import { httpApi } from "./httpApi";
import { Logger } from "./Logger";
import { Peer } from "./Peer";
import { Swarm } from "./Swarm";

export interface ISwarms {
  [swarmId: string]: Swarm;
}

export class Server extends EventEmitter {
  private wss: WebSocket.Server;
  private swarms: ISwarms;

  constructor(port: number) {
    super();

    this.swarms = {};

    const app = httpApi(this.swarms);

    const httpServer = createServer(app.callback());

    this.wss = new WebSocket.Server({
      server: httpServer
    });

    this.wss.on("listening", this.emit.bind(this, "listening"));
    this.wss.on("close", this.emit.bind(this, "close"));
    this.wss.on("error", this.emit.bind(this, "error"));
    this.wss.on("connection", this.onConnection.bind(this));

    httpServer.listen(port);
  }

  private onConnection(ws: WebSocket, request: IncomingMessage) {
    if (!request.url) {
      Logger.warn("Invalid request received");

      return;
    }

    const { pathname } = URL.parse(request.url);

    if (!pathname) {
      Logger.warn("Empty path in the request", {
        url: request.url
      });

      return;
    }

    const swarmId = decodeURIComponent(pathname.slice(1));

    if (swarmId.length === 0) {
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
