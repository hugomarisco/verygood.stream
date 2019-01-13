export class Offer {
  public socketId: string;
  public offer: object;

  constructor(socketId: string, offer: object) {
    this.socketId = socketId;
    this.offer = offer;
  }
}