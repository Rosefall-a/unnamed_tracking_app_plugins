from sdk.plugin_protocol import request

def main():
    request("client.identity","games.read",{"scope":"user-device"})
    request("storage.put","plugin.storage",{"key":"pairing/status","value":"paired"})
    request("lifecycle.ready","plugin.storage",{"state":"ready"})

if __name__=="__main__": main()
