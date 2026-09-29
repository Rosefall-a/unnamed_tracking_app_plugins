from sdk.plugin_protocol import request

def main():
    state=request("storage.get","plugin.storage",{"key":"counter"})
    counter=int(state.get("value",0) or 0)+1
    request("storage.put","plugin.storage",{"key":"counter","value":str(counter)})
    request("lifecycle.ready","plugin.settings",{"state":"ready","counter":counter})

if __name__=="__main__": main()
