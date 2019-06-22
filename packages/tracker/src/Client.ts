import EventEmitter from "events";
import { SignalData } from "simple-peer";
import { Duplex } from "stream";
import { v4 as UUIDv4 } from "uuid";
import WebSocket from "ws";
import { WebRTCSocket } from "./WebRTCSocket";

const OFFERS_WATERLINE = 10;

export class Client extends EventEmitter {
  private trackerSocket: WebSocket;
  private peerSockets: { [socketId: string]: WebRTCSocket };

  constructor(url: string) {
    super();

    this.trackerSocket =
      typeof window !== "undefined"
        ? new (window as any).WebSocket(url)
        : new WebSocket(url);

    this.trackerSocket.onopen = this.onOpen.bind(this);
    this.trackerSocket.onmessage = this.onMessage.bind(this);
    this.trackerSocket.onerror = this.emit.bind(this, "error");

    this.peerSockets = {};
  }

  private announceOffer() {
    const socketId = UUIDv4();

    const peerSocket = new WebRTCSocket({ initiator: true });

    peerSocket.once("signal", this.offer.bind(this, socketId));
    peerSocket.once("connect", this.onPeerSocket.bind(this, peerSocket, true));

    this.peerSockets[socketId] = peerSocket;
  }

  private send(type: string, payload?: object) {
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
    for (let i = 0; i < OFFERS_WATERLINE; i++) {
      this.announceOffer();
    }

    this.send("find");
  }

  private onPeerSocket(peerSocket: Duplex, isInitiator: boolean) {
    this.emit("peerSocket", peerSocket, isInitiator);

    this.announceOffer();
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

          peerSocket.once(
            "connect",
            this.onPeerSocket.bind(this, peerSocket, false)
          );

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
