from sdk.plugin_protocol import request

def main():
    request("games.list","games.read",{"limit":50})
    request("settings.get","plugin.settings",{"key":"display_mode"})
    request("lifecycle.ready","plugin.settings",{"state":"ready"})

if __name__=="__main__": main()
