module.exports = {
    createHandshake: (clientId) => ({
        type: "handshake",
        clientId
    }),

    createCommand: (command, data) => ({
        type: "command",
        command,
        data
    }),

    commandsList: {
        moveObject: "moveObject",
        showMessage: "showMessage",
        changeColor: "changeColor",
    },
    messageTypes: {
        handshakeResponse: "handshakeResponse",
        commandCompleted: "commandCompleted"
    }
};