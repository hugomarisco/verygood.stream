import EventEmitter from "events";
import { TrackerClient } from "./TrackerClient";

export class SwarmTrackers extends EventEmitter {
  private trackerClients: TrackerClient[];

  constructor(trackerUrls: string[]) {
    super();

    this.trackerClients = trackerUrls.map(trackerUrl => {
      const tracker = new TrackerClient(trackerUrl);

      tracker.on("peerSocket", this.emit.bind(null, "peerSocket"));

      return tracker;
    });
  }
}
