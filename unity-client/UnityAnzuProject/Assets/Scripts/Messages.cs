using UnityEngine;

[System.Serializable]
public class Message
{
    public string type;
    public string clientId;
    public string command;
    public CommandData data;
}

[System.Serializable]
public class CommandData
{
    public int x;
    public int y;
    public string text;
    public string color;
}

[System.Serializable]
public class HandshakeResponse
{
    public string type;
    public string clientId;
}

[System.Serializable]
public class CommandCompleted
{
    public string type;
    public string clientId;
    public string command;
    public string result;
}