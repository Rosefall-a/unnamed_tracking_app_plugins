from sdk.plugin_protocol import request

def main():
    request("notifications.send", "notifications.send", {"title": "Example notification", "body": "Plugin API v1 is working."})
    request("lifecycle.ready", "notifications.send", {"state": "ready"})

if __name__ == "__main__":
    main()
