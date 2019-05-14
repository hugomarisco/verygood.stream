import { EventEmitter } from "events";

export const WebRTCSocket = jest.fn().mockImplementation(() => {
  const eventEmitter = new EventEmitter();

  return {
    emit: eventEmitter.emit.bind(eventEmitter),
    on: eventEmitter.on.bind(eventEmitter),
    send: jest.fn()
  };
});
