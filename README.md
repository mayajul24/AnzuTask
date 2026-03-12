Server-Unity Communication

A WebSocket server (Node.js) and Unity client that communicate via a JSON-based protocol with handshake, command execution, and response handling.

Requirements

- Node.js (v19+ recommended)
- Unity 2018

Project Structure

ServerUnityProject/
├── server/
│   ├── src/
│   │   ├── server.js              # Main server entry point
│   │   ├── clients/
│   │   │   └── clientManager.js   # Client lifecycle & command queue
│   │   └── protocol/
│   │       └── messages.js        # Message format definitions
│   └── tests/
│       └── clientManager.test.js  # Jest unit tests
└── unity-client/UnityAnzuProject/
    └── Assets/
        ├── Scripts/
        │   ├── WebSocketClient.cs # Main client - connects, receives & executes commands
        │   ├── Messages.cs        # Message data models (mirrors server protocol)
        │   └── UnityMainThread.cs # Dispatches WebSocket callbacks to Unity main thread
        ├── Plugins/
        │   ├── websocket-sharp.dll  # WebSocket library
        │   └── Newtonsoft.Json.dll  # JSON serialization
        ├── Prefabs/
        │   └── Enemy.prefab
        └── Scenes/
            └── game.unity


Running the Server

bash
cd server
npm install
npm start

The server starts on `ws://localhost:8080` by default. To use a different port:

bash
PORT=3000 npm start


Running Tests

bash
cd server
npm test

Running the Unity Client

1. Open `unity-client/UnityAnzuProject` in Unity 2018
2. Open the `game` scene from `Assets/`
3. Make sure a GameObject in the scene has the `WebSocketClient` and `UnityMainThread` scripts attached
4. Press Play — the client connects to `ws://localhost:8080` automatically

Protocol

All messages are JSON over WebSocket. The flow is:

1. Client connects — server sends a handshake message with a unique clientId
2. Client responds — sends handshakeResponse to confirm
3. Server sends commands — queued and sent one at a time
4. Client executes and responds — sends commandCompleted when done
5. Server sends the next queued command

Supported Commands

moveObject({ x, y }) - Move the GameObject to the given position 
showMessage({ text }) - Display text in a UI Text element 
changeColor({ color }) - Change the GameObject's material color (HTML color string, e.g. "blue", "#FF0000")

Architecture Notes

- Command queue: The server sends commands one at a time per client, waiting for a `commandCompleted` response before sending the next
- Thread safety: Unity's API can only be called from the main thread. Since WebSocket callbacks arrive on a background thread, `UnityMainThread` queues actions to execute during `Update()`
- Command handler pattern**: The Unity client uses a dictionary mapping command names to handler functions, making it easy to add new commands