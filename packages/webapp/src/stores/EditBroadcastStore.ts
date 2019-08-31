import { action, observable } from "mobx";

export interface ICategory {
  categoryId: number;
  name: string;
}

export interface IBroadcast {
  broadcastId?: string;
  swarmId: string;
  categoryId: number;
  title: string;
  category?: ICategory;
  chunkSize: number;
  chunkAddressingMethod: number;
  contentIntegrityProtectionMethod: number;
  liveSignatureAlgorithm?: number;
}

export class EditBroadcastStore {
  @observable public broadcast?: IBroadcast;
  @observable public isFetching: boolean = false;
  @observable public isSaved: boolean = false;

  @action public async fetchById(broadcastId: string) {
    this.isFetching = true;

    const response = await fetch(
      `http://${process.env.REACT_APP_API_URL}/broadcasts/${broadcastId}`
    );

    if (response.ok) {
      const { payload: broadcast } = await response.json();

      this.broadcast = broadcast;
    }

    this.isFetching = false;
  }

  @action public async fetch(swarmId: string) {
    this.isFetching = true;

    const response = await fetch(
      `http://${process.env.REACT_APP_API_URL}/broadcasts?swarmId=${swarmId}`
    );

    if (response.ok) {
      const {
        payload: [broadcast]
      } = await response.json();

      this.broadcast = broadcast || {
        categoryId: 1,
        swarmId,
        title: ""
      };
    }

    this.isFetching = false;
  }

  @action public async save({ broadcastId, ...broadcast }: IBroadcast) {
    const response = await fetch(
      broadcastId
        ? `http://${process.env.REACT_APP_API_URL}/broadcasts/${broadcastId}`
        : `http://${process.env.REACT_APP_API_URL}/broadcasts`,
      {
        body: JSON.stringify(broadcast),
        headers: { "Content-Type": "application/json" },
        method: broadcastId ? "PATCH" : "POST"
      }
    );

    if (response.ok) {
      const { payload: persistedBroadcast } = await response.json();

      this.broadcast = persistedBroadcast;
      this.isSaved = true;
    }
  }
}
