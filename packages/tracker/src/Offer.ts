export class Offer {
  public wrtcSocketId: string;
  public signalData: string;

  constructor(wrtcSocketId: string, signalData: string) {
    this.wrtcSocketId = wrtcSocketId;
    this.signalData = signalData;
  }
}
