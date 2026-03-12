using System;
using UnityEngine;
using UnityEngine.UI;
using WebSocketSharp;
using Newtonsoft.Json;
using System.Collections.Generic;

public class WebSocketClient : MonoBehaviour
{
    [SerializeField] private Text messageText;
    private WebSocket websocket;
    private string clientId;
    private Renderer targetRenderer;
    private Dictionary<string, Action<CommandData>> commandHandlers;

    void Awake()
    {
        targetRenderer = GetComponent<Renderer>();
        commandHandlers = new Dictionary<string, Action<CommandData>>
        {
            { "moveObject", data => UnityMainThread.Call(() => transform.position = new Vector3(data.x, data.y, 0)) },
            { "showMessage", data => UnityMainThread.Call(() => { if (messageText) messageText.text = data.text; }) },
            { "changeColor", data => UnityMainThread.Call(() => {
                if (targetRenderer && ColorUtility.TryParseHtmlString(data.color, out Color c))
                    targetRenderer.material.color = c;
            }) }
        };
    }

    void Start()
    {
        websocket = new WebSocket("ws://localhost:8080");
        websocket.OnOpen += (_, __) => Log("Connected to server");
        websocket.OnMessage += (_, e) => HandleMessage(e.Data);
        websocket.OnError += (_, e) => LogError(e.Message);
        websocket.OnClose += (_, __) => Log("Connection closed");
        websocket.ConnectAsync();
    }

    private void HandleMessage(string json)
    {
        if (string.IsNullOrEmpty(json)) return;

        try
        {
            var message = JsonConvert.DeserializeObject<Message>(json);
            if (message == null || string.IsNullOrEmpty(message.type)) return;

            switch (message.type)
            {
                case "handshake":
                    clientId = message.clientId;
                    Send(new HandshakeResponse { type = "handshakeResponse", clientId = clientId });
                    break;

                case "command":
                    if (commandHandlers.TryGetValue(message.command, out var handler))
                    {
                        handler(message.data);
                        Send(new CommandCompleted { type = "commandCompleted", clientId = clientId, command = message.command, result = $"Executed {message.command}" });
                    }
                    else
                    {
                        LogWarning($"Unknown command: {message.command}");
                    }
                    break;

                default:
                    LogWarning($"Unknown message type: {message.type}");
                    break;
            }
        }
        catch (Exception e)
        {
            LogError($"Failed to parse message: {e.Message}");
        }
    }

    private void Send(object message)
    {
        var json = JsonConvert.SerializeObject(message);
        websocket.Send(json);
        Log($"Sent: {json}");
    }

    void OnDestroy()
    {
        if (websocket != null && websocket.IsAlive) websocket.Close();
    }

    private void Log(string message) => Debug.Log($"[{clientId}] {message}");
    private void LogWarning(string message) => Debug.LogWarning($"[{clientId}] {message}");
    private void LogError(string message) => Debug.LogError($"[{clientId}] {message}");
}