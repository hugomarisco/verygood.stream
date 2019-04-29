import EventEmitter from "events";
import { SignalData } from "simple-peer";
import { v4 as UUIDv4 } from "uuid";
import WebSocket from "ws";
import { WebRTCSocket } from "./WebRTCSocket";

export class TrackerClient extends EventEmitter {
  private trackerSocket: WebSocket;
  private peerSockets: { [socketId: string]: WebRTCSocket };

  constructor(url: string) {
    super();

    this.trackerSocket =
      typeof window !== "undefined"
        ? new window.WebSocket(url)
        : new WebSocket(url);

    this.trackerSocket.onopen = this.onOpen.bind(this);
    this.trackerSocket.onmessage = this.onMessage.bind(this);
    this.trackerSocket.onerror = this.emit.bind(this, "error");

    this.peerSockets = {};
  }

  private send(type: string, payload: object) {
    this.trackerSocket.send(
      JSON.stringify({
        payload,
        type
      })
    );
  }

  private offer(socketId: string, signalData: SignalData) {
    this.send("offer", { socketId, signalData });
  }

  private answer(peerId: string, socketId: string, signalData: SignalData) {
    this.send("answer", { peerId, socketId, signalData });
  }

  private onOpen() {
    for (let i = 0; i < 10; i++) {
      const socketId = UUIDv4();

      const peerSocket = new WebRTCSocket({ initiator: true });

      peerSocket.once("signal", this.offer.bind(this, socketId));
      peerSocket.once(
        "connect",
        this.emit.bind(this, "peerSocket", peerSocket, false)
      );

      this.peerSockets[socketId] = peerSocket;
    }

    this.send("find", {});
  }

  private onMessage(event: { data: WebSocket.Data }) {
    try {
      let peerSocket: WebRTCSocket;

      const message = JSON.parse(event.data as string);

      switch (message.type) {
        case "offer":
          peerSocket = new WebRTCSocket();

          peerSocket.once(
            "signal",
            this.answer.bind(
              this,
              message.payload.peerId,
              message.payload.socketId
            )
          );

          peerSocket.once("connect", () => {
            this.emit("peerSocket", peerSocket, false);
          });

          peerSocket.signal(message.payload.signalData);

          break;
        case "answer":
          peerSocket = this.peerSockets[message.payload.socketId];

          if (peerSocket) {
            peerSocket.signal(message.payload.signalData);
          }

          break;
      }
    } catch (err) {
      this.emit("error", err);
    }
  }
}
