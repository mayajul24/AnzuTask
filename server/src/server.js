const crypto = require("crypto");
const WebSocket = require("ws");
const ClientManager = require("./clients/clientManager");
const clientManager = new ClientManager();
const messages = require("./protocol/messages");

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

console.log(`Server started on ws://localhost:${PORT}`);

const messageTypeToHandler = {
    [messages.messageTypes.handshakeResponse]: handleHandshakeResponse,
    [messages.messageTypes.commandCompleted]: handleCommandCompleted
};

function generateClientId() {
    return crypto.randomUUID();
}

function createInitialCommands() {
    return [
        messages.createCommand(messages.commandsList.moveObject, { x: 0, y: 0 }),
        messages.createCommand(messages.commandsList.showMessage, { text: "Hello World!" }),
        messages.createCommand(messages.commandsList.changeColor, { color: "blue" })
    ];
}

function handleHandshakeResponse(clientId, message) {
    console.log(`Handshake completed with client ${clientId}`);
    const commands = createInitialCommands();
    commands.forEach(cmd => clientManager.sendCommand(clientId, cmd));
}

function handleCommandCompleted(clientId, message) {
    console.log(`Client ${clientId} completed command: ${message.command} with result: ${message.result}`);
    clientManager.commandCompleted(clientId);
}

function handleMessage(clientId, message) {
    const handler = messageTypeToHandler[message.type];
    if (!handler) {
        console.log("Unknown message type:", message.type);
        return;
    }
    handler(clientId, message);
}

server.on("connection", (socket) => {
    const clientId = generateClientId();
    console.log(`Client connected: ${clientId}`);
    clientManager.addClient(clientId, socket);

    socket.send(JSON.stringify(messages.createHandshake(clientId)));

    socket.on("message", (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleMessage(clientId, message);
        } catch (err) {
            console.error("Invalid message:", err);
        }
    });

    socket.on("close", () => {
        console.log(`Client disconnected: ${clientId}`);
        clientManager.removeClient(clientId);
    });

    socket.on("error", (err) => {
        console.error(`Socket error for client ${clientId}:`, err.message);
    });
});

server.on("error", (err) => {
    console.error("Server error:", err.message);
});

process.on("SIGINT", () => {
    console.log("\nShutting down server...");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});