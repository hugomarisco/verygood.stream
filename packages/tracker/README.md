# `tracker`

A simple WebSocket tracker for PPSPP.

## Usage

- Connect

`ws(s)://<host>/<swarmId>`

- Find peers

```json
{ "type": "find" }
```

- Offer

```json
{
  "type": "offer",
  "payload": { "offer": "<wrtcOffer>" }
}
```

- Answer

```json
{
  "type": "answer",
  "payload": { "peerId": "<peerId>", "answer": "<wrtcOffer>" }
}
```
