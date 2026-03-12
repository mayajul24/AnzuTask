const WebSocket = require("ws");

class ClientManager {
    constructor() {
        this._clients = new Map();
    }

    addClient(clientId, socket) {
        this._clients.set(clientId, { socket, queue: [] });
    }

    removeClient(clientId) {
        this._clients.delete(clientId);
    }

    getClient(clientId) {
        return this._clients.get(clientId);
    }

    sendCommand(clientId, command) {
        const client = this._clients.get(clientId);
        if (!client) {
            console.warn(`sendCommand: client ${clientId} not found`);
            return;
        }

        client.queue.push(command);

        if (client.queue.length === 1 && client.socket.readyState === WebSocket.OPEN) {
            client.socket.send(JSON.stringify(command));
        }
    }

    commandCompleted(clientId) {
        const client = this._clients.get(clientId);
        if (!client) return;

        client.queue.shift();

        if (client.queue.length > 0 && client.socket.readyState === WebSocket.OPEN) {
            client.socket.send(JSON.stringify(client.queue[0]));
        }
    }
}

module.exports = ClientManager;