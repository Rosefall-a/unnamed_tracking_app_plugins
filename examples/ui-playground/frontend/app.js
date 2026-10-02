const {createApp,ref}=Vue;

function pluginRequest(method,payload={}) {
  return new Promise((resolve,reject)=>{
    const requestId=crypto.randomUUID();
    const onMessage=(event)=>{
      if(event.data?.type!=="plugin-api-response"||event.data.requestId!==requestId)return;
      window.removeEventListener("message",onMessage);
      event.data.error?reject(new Error(event.data.error)):resolve(event.data.result||{});
    };
    window.addEventListener("message",onMessage);
    window.parent.postMessage({type:"plugin-api-request",requestId,method,payload},"*");
  });
}

createApp({
  setup(){
    const page=ref("overview"), webhook=ref(""), saved=ref(false), message=ref(""), error=ref("");
    const pages=[
      ["overview","Overview"],["library","Library"],["details","Details"],["diagnostics","Diagnostics"]
    ];
    async function saveWebhook(){
      error.value=""; message.value="";
      try{
        await pluginRequest("plugin.save-secret",{key:"discord_webhook",value:webhook.value});
        saved.value=true; message.value="Webhook saved to the plugin data directory.";
      }catch(err){error.value=err.message}
    }
    async function announce(){
      error.value=""; message.value="";
      try{
        await pluginRequest("plugin.run-action",{actionId:"announce-page",values:{_plugin_context:JSON.stringify({page_id:page.value,page_title:pages.find(([id])=>id===page.value)?.[1]||page.value,path:"/settings?section=plugins"})}});
        message.value="Announcement sent.";
      }catch(err){error.value=err.message}
    }
    return {page,pages,webhook,saved,message,error,saveWebhook,announce};
  },
  template:`
  <main>
    <header><h1>Plugin UI Playground</h1><p>A real Vue 3 frontend supplied by the plugin package.</p></header>
    <nav><button v-for="item in pages" :key="item[0]" :class="{active:page===item[0]}" @click="page=item[0]">{{item[1]}}</button></nav>
    <section><h2>{{pages.find(item=>item[0]===page)?.[1]}}</h2><p>Current page: <strong>{{page}}</strong></p><p>This page is rendered by the plugin's own Vue application, not the host's declarative UI renderer.</p></section>
    <section>
      <h2>Discord announcement</h2>
      <label>Discord webhook
        <input v-model="webhook" type="password" autocomplete="new-password" placeholder="https://discord.com/api/webhooks/...">
      </label>
      <button @click="saveWebhook">Save webhook securely</button>
      <button @click="announce">Announce this page</button>
      <p v-if="saved" class="status">A secret was saved without putting it in ordinary plugin settings or browser storage.</p>
      <p v-if="message" class="status">{{message}}</p><p v-if="error" class="error">{{error}}</p>
    </section>
  </main>`
}).mount("#app");
