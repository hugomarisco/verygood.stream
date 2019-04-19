import EventEmitter from "events";
import { SignalData } from "simple-peer";
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

    this.trackerSocket =
      typeof window !== "undefined"
        ? new window.WebSocket(url)
        : new WebSocket(url);

    this.trackerSocket.onopen = this.onOpen.bind(this);
    this.trackerSocket.onmessage = this.onMessage.bind(this);

    this.peerSockets = {};
  }

  private send(type: string, payload: object) {
    this.trackerSocket.send(
      JSON.stringify({
        type,
        swarmId: this.swarmId,
        payload
      })
    );
  }

  private offer(socketId: string, offer: SignalData) {
    this.send("offer", { socketId, offer });
  }

  private answer(socketId: string, answer: SignalData) {
    this.send("answer", { socketId, answer });
  }

  private onOpen() {
    for (let i = 0; i < 2; i++) {
      const socketId = UUIDv4();

      const peerSocket = new WebRTCSocket({ initiator: true });

      peerSocket.once("signal", this.offer.bind(this, socketId));
      peerSocket.once(
        "connect",
        this.emit.bind(null, "peerSocket", peerSocket)
      );

      this.peerSockets[socketId] = peerSocket;
    }

    this.send("find", {});
  }

  private onMessage(data: string) {
    try {
      let peerSocket: WebRTCSocket;

      const message = JSON.parse(data.data ? data.data : data);

      switch (message.type) {
        case "offer":
          peerSocket = new WebRTCSocket();

          peerSocket.on(
            "signal",
            this.answer.bind(this, message.payload.socketId)
          );
          peerSocket.on("connect", () => {
            debugger;
            this.emit("peerSocket", peerSocket);
          });

          peerSocket.signal(message.payload.offer);

          break;
        case "answer":
          peerSocket = this.peerSockets[message.payload.socketId];

          if (peerSocket) {
            //delete this.peerSockets[message.payload.socketId];
            peerSocket.signal(message.payload.answer);
          }

          break;
      }
    } catch (err) {
      this.emit("error", err);
    }
  }
}
