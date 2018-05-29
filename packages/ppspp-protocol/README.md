# ppspp-protocol

An implementation of Peer-to-Peer Streaming Peer Protocol (RFC7574) in JavaScript

**Under active development**

## Installation

- Clone the project
- `yarn install`

## Usage

```
const Protocol = require('ppspp-protocol');

const protocol = new Protocol();

const socket = new net.Socket(...);

protocol.on('handshake', res => protocol.handshake(...));

socket.pipe(protocol).pipe(socket);
```

## Test the project

`yarn test`

## Notes

This project is heavily inspired on https://github.com/webtorrent/bittorrent-protocol

The goal is to have a fully working implementation of the protocol using WebRTC as the transport layer.

## License

MIT. Copyright (c) 2018 Hugo Mendes