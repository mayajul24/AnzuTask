# Server-Unity Communication

A WebSocket server (Node.js) and Unity client that communicate via a JSON-based protocol with handshake, command execution, and response handling.

## Requirements

- Node.js (v19+ recommended)
- Unity 2018

## Running the Server

```bash
cd server
npm install
npm start
```

The server starts on `ws://localhost:8080` by default. To use a different port:

```bash
PORT=3000 npm start
```

## Running Tests

```bash
cd server
npm test
```

## Running the Unity Client

1. Open `unity-client/UnityAnzuProject` in Unity 2018
2. Open the `game` scene from `Assets/`
3. Make sure a GameObject in the scene has the `WebSocketClient` and `UnityMainThread` scripts attached
4. Press Play - the client connects to `ws://localhost:8080` automatically

## Protocol

All messages are JSON over WebSocket. The flow is:

1. Client connects - server sends a handshake message with a unique `clientId`
2. Client responds - sends `handshakeResponse` to confirm
3. Server sends commands - queued and sent one at a time
4. Client executes and responds - sends `commandCompleted` when done
5. Server sends the next queued command

## Supported Commands

* moveObject({ x, y }) - Move the GameObject to the given position 
* showMessage({ text }) - Display text in a UI Text element 
* changeColor({ color }) - Change the GameObject's material color (HTML color string, e.g. "blue", "#FF0000")
