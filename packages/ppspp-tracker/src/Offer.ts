export class Offer {
  public swarmId: string;
  public peerId: string;
  public offer: string;

  constructor(swarmId: string, peerId: string, offer: string) {
    this.swarmId = swarmId;
    this.peerId = peerId;
    this.offer = offer;
  }
}