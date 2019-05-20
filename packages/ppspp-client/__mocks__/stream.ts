import { EventEmitter } from "events";

export const Duplex = jest.fn().mockImplementation(() => {
  const eventEmitter = new EventEmitter();

  return {
    emit: eventEmitter.emit.bind(eventEmitter),
    on: eventEmitter.on.bind(eventEmitter),
    write: jest.fn()
  };
});

export default jest.fn();
