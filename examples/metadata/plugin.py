from sdk.plugin_protocol import request

def main():
    request("games.metadata.search", "games.read", {"query": "Example Game", "limit": 10})
    request("lifecycle.ready", "games.read", {"state": "ready"})

if __name__ == "__main__":
    main()
