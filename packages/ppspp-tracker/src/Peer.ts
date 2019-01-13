import { v4 as UUIDv4 } from "uuid";
import WebSocket from "ws";

export class Peer {
  public peerId: string;
  public swarmId?: string;
  public ws: WebSocket;
  public offers: { [socketId: string]: object };

  constructor(ws: WebSocket) {
    this.peerId = UUIDv4();
    this.ws = ws;
    this.offers = {};
  }

  public hasOffers() {
    return Object.keys(this.offers).length > 0;
  }

  public getOffer() {
    if (this.hasOffers()) {
      const socketId = Object.keys(this.offers)[0];

      const offer = this.offers[socketId];

      delete this.offers[socketId];

      return { socketId, offer };
    }

    return null;
  }

  public addOffer(swarmId: string, socketId: string, offer: object) {
    this.swarmId = swarmId;

    this.offers[socketId] = offer;
  }

  public answer(socketId: string, answer: object) {
    if (this.offers[socketId]) {
      this.ws.send(
        JSON.stringify({ type: "answer", payload: { socketId, answer } })
      );
    }
  }
}
