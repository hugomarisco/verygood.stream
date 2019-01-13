import EventEmitter from "events";
import { SignalData } from "simple-peer";
import URL from "url";
import { v4 as UUIDv4 } from "uuid";
import WebSocket from "ws";
import { WebRTCSocket } from "./WebRTCSocket";

export class TrackerClient extends EventEmitter {
  private trackerSocket: WebSocket;
  private swarmId: Buffer;
  private peerSockets: { [peerId: string]: WebRTCSocket };

  constructor(url: string, swarmId: Buffer) {
    super();

    this.swarmId = swarmId;

    const parsedUrl = URL.parse(url);

    if (parsedUrl.protocol !== "ws" && parsedUrl.protocol !== "wss") {
      throw new Error(
        "The tracker must use websocket for the communication protocol"
      );
    }

    this.trackerSocket = new WebSocket(parsedUrl.toString());

    this.trackerSocket.on("open", this.onOpen.bind(this));
    this.trackerSocket.on("message", this.onMessage.bind(this));

    this.peerSockets = {};
  }

  private send(type: string, payload: object) {
    this.trackerSocket.send(
      JSON.stringify({ type, swarmId: this.swarmId, payload })
    );
  }

  private offer(socketId: string, offer: SignalData) {
    this.send("offer", { socketId, offer });
  }

  private answer(socketId: string, answer: SignalData) {
    this.send("answer", { socketId, answer });
  }

  private onOpen() {
    for (let i = 0; i < 10; i++) {
      const socketId = UUIDv4();

      const peerSocket = new WebRTCSocket({ initiator: true });

      peerSocket.on("signal", this.offer.bind(this, socketId));
      peerSocket.on("connect", this.emit.bind(null, "peerSocket", peerSocket));

      this.peerSockets[socketId] = peerSocket;
    }
  }

  private onMessage(data: string) {
    try {
      let peerSocket: WebRTCSocket;

      const message = JSON.parse(data);

      switch (message.type) {
        case "offer":
          peerSocket = new WebRTCSocket();

          peerSocket.signal(message.payload.offer);

          peerSocket.on(
            "signal",
            this.answer.bind(null, message.payload.socketId)
          );
          peerSocket.on(
            "connect",
            this.emit.bind(null, "peerSocket", peerSocket)
          );

          break;
        case "answer":
          peerSocket = this.peerSockets[message.payload.socketId];

          if (peerSocket) {
            delete this.peerSockets[message.payload.socketId];

            peerSocket.signal(message.payload.answer);
          }

          break;
      }
    } catch (err) {
      this.emit("error", err);
    }
  }
}
