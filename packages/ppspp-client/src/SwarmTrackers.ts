import EventEmitter from "events";
import { TrackerClient } from "./TrackerClient";

export class SwarmTrackers extends EventEmitter {
  private trackerClients: TrackerClient[];

  constructor(trackerUrls: string[]) {
    super();

    this.trackerClients = trackerUrls.map(trackerUrl => {
      const tracker = new TrackerClient(trackerUrl);

      tracker.on("peers", this.emit);

      return tracker;
    });
  }

  public register() {
    this.trackerClients.forEach(trackerClient => trackerClient.register());
  }
}
