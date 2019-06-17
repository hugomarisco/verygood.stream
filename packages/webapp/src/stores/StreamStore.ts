import { action, observable } from "mobx";

export class StreamStore {
  @observable public stream: any = null;

  @action public async fetch(id) {
    const response = await fetch(`http://localhost:3000/streams/${id}`);

    if (response.ok) {
      const { payload: stream } = await response.json();

      this.stream = stream;
    }
  }
}
