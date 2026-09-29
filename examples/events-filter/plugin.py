from sdk.plugin_protocol import request

def main():
    request("events.subscribe", "events.subscribe", {"event_types": ["game.updated"], "user_ids": ["CONFIGURED_USER_ID"], "max_events_per_minute": 10})
    request("lifecycle.ready", "events.subscribe", {"state": "ready"})

if __name__ == "__main__":
    main()
