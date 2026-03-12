const WebSocket = require("ws");
const ClientManager = require("../src/clients/clientManager");

function createMockSocket() {
    return { readyState: WebSocket.OPEN, send: jest.fn() };
}

describe("ClientManager", () => {
    let manager;

    beforeEach(() => {
        manager = new ClientManager();
    });

    describe("addClient / removeClient", () => {
        test("adds a client and retrieves it", () => {
            const socket = createMockSocket();
            manager.addClient("client1", socket);

            const client = manager.getClient("client1");
            expect(client).toBeDefined();
            expect(client.socket).toBe(socket);
            expect(client.queue).toEqual([]);
        });

        test("removes a client", () => {
            manager.addClient("client1", createMockSocket());
            manager.removeClient("client1");

            expect(manager.getClient("client1")).toBeUndefined();
        });
    });

    describe("sendCommand", () => {
        test("sends the first command immediately", () => {
            const socket = createMockSocket();
            manager.addClient("client1", socket);

            const cmd = { type: "command", command: "moveObject" };
            manager.sendCommand("client1", cmd);

            expect(socket.send).toHaveBeenCalledTimes(1);
            expect(socket.send).toHaveBeenCalledWith(JSON.stringify(cmd));
        });

        test("queues subsequent commands without sending", () => {
            const socket = createMockSocket();
            manager.addClient("client1", socket);

            const cmd1 = { type: "command", command: "moveObject" };
            const cmd2 = { type: "command", command: "showMessage" };

            manager.sendCommand("client1", cmd1);
            manager.sendCommand("client1", cmd2);

            expect(socket.send).toHaveBeenCalledTimes(1);
            expect(socket.send).toHaveBeenCalledWith(JSON.stringify(cmd1));
        });

        test("does nothing for unknown client", () => {
            expect(() => {
                manager.sendCommand("unknown", { type: "command" });
            }).not.toThrow();
        });

        test("does not send if socket is not open", () => {
            const socket = createMockSocket();
            socket.readyState = WebSocket.CLOSED;
            manager.addClient("client1", socket);

            manager.sendCommand("client1", { type: "command", command: "moveObject" });

            expect(socket.send).not.toHaveBeenCalled();
        });
    });

    describe("commandCompleted", () => {
        test("sends the next queued command", () => {
            const socket = createMockSocket();
            manager.addClient("client1", socket);

            const cmd1 = { type: "command", command: "moveObject" };
            const cmd2 = { type: "command", command: "showMessage" };

            manager.sendCommand("client1", cmd1);
            manager.sendCommand("client1", cmd2);
            socket.send.mockClear();

            manager.commandCompleted("client1");

            expect(socket.send).toHaveBeenCalledTimes(1);
            expect(socket.send).toHaveBeenCalledWith(JSON.stringify(cmd2));
        });

        test("does not send when queue is empty after completion", () => {
            const socket = createMockSocket();
            manager.addClient("client1", socket);

            manager.sendCommand("client1", { type: "command", command: "moveObject" });
            socket.send.mockClear();

            manager.commandCompleted("client1");

            expect(socket.send).not.toHaveBeenCalled();
        });

        test("processes full queue in order", () => {
            const socket = createMockSocket();
            manager.addClient("client1", socket);

            const cmd1 = { type: "command", command: "moveObject" };
            const cmd2 = { type: "command", command: "showMessage" };
            const cmd3 = { type: "command", command: "changeColor" };

            manager.sendCommand("client1", cmd1);
            manager.sendCommand("client1", cmd2);
            manager.sendCommand("client1", cmd3);

            expect(socket.send).toHaveBeenLastCalledWith(JSON.stringify(cmd1));

            manager.commandCompleted("client1");
            expect(socket.send).toHaveBeenLastCalledWith(JSON.stringify(cmd2));

            manager.commandCompleted("client1");
            expect(socket.send).toHaveBeenLastCalledWith(JSON.stringify(cmd3));
        });

        test("does nothing for unknown client", () => {
            expect(() => {
                manager.commandCompleted("unknown");
            }).not.toThrow();
        });
    });
});