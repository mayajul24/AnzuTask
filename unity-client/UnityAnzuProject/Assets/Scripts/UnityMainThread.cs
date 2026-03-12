using System;
using System.Collections.Generic;
using UnityEngine;

public class UnityMainThread : MonoBehaviour
{
    private static UnityMainThread instance;
    private static readonly Queue<Action> actions = new Queue<Action>();

    void Awake()
    {
        instance = this;
    }

    void Update()
    {
        while (actions.Count > 0)
        {
            actions.Dequeue().Invoke();
        }
    }

    public static void Call(Action action)
    {
        actions.Enqueue(action);
    }
}