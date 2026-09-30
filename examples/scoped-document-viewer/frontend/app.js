const documents = document.querySelector("#documents");
const viewer = document.querySelector("#viewer");
const status = document.querySelector("#status");
let activeObjectUrl = null;

function pluginRequest(method, payload = {}) {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const onMessage = (event) => {
      if (event.source !== window.parent || event.data?.type !== "plugin-api-response" || event.data.requestId !== requestId) return;
      window.removeEventListener("message", onMessage);
      event.data.error ? reject(new Error(event.data.error)) : resolve(event.data.result || {});
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({type: "plugin-api-request", requestId, method, payload}, "*");
  });
}

function safeHtml(source) { const doc = new DOMParser().parseFromString(source, "text/html"); for (const element of doc.querySelectorAll("script,iframe,object,embed,form,input,link,meta,style,video,audio,source")) element.remove(); for (const element of doc.querySelectorAll("*")) for (const attr of [...element.attributes]) { if (attr.name.toLowerCase().startsWith("on") || attr.name.toLowerCase() === "style" || attr.name.toLowerCase() === "srcdoc") element.removeAttribute(attr.name); if (attr.name.toLowerCase() === "href" && !/^(https?:|mailto:|#)/i.test(attr.value)) element.removeAttribute(attr.name); } return doc.body.innerHTML; }

function clearViewer() {
  if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
  activeObjectUrl = null;
  viewer.replaceChildren();
}

async function openDocument(item) {
  status.textContent = `Opening ${item.filename}…`;
  clearViewer();
  try {
    const result = await pluginRequest("plugin.run-action", {actionId: "read-document", values: {document_id: item.id}});
    const bytes = Uint8Array.from(atob(result.content), (character) => character.charCodeAt(0));
    const mediaType = result.document?.media_type;
    if (mediaType === "application/pdf") {
      activeObjectUrl = URL.createObjectURL(new Blob([bytes], {type: mediaType}));
      const frame = document.createElement("iframe");
      frame.title = result.document.filename;
      frame.src = activeObjectUrl;
      viewer.append(frame);
    } else if (mediaType === "text/plain") {
      const text = new TextDecoder("utf-8", {fatal: true}).decode(bytes);
      const pre = document.createElement("pre");
      pre.textContent = text;
      viewer.append(pre);
    } else if (mediaType === "text/html") {
      const text = new TextDecoder("utf-8", {fatal: true}).decode(bytes);
      const article = document.createElement("article");
      article.innerHTML = safeHtml(text);
      viewer.append(article);
    } else {
      throw new Error("The host returned an unsupported document representation.");
    }
    status.textContent = `${result.document.filename} opened.`;
  } catch (error) {
    viewer.innerHTML = '<p class="error">The document could not be opened. It may be missing, unsupported, oversized, or no longer permitted.</p>';
    status.textContent = error instanceof Error ? error.message : "Document unavailable.";
  }
}

async function refresh() {
  status.textContent = "Loading documents…";
  documents.replaceChildren();
  clearViewer();
  try {
    const result = await pluginRequest("plugin.run-action", {actionId: "list-documents", values: {limit: 200}});
    for (const item of result.documents || []) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${item.game_title} — ${item.filename}`;
      button.addEventListener("click", () => openDocument(item));
      const row = document.createElement("li");
      row.append(button);
      documents.append(row);
    }
    if (!documents.children.length) documents.innerHTML = '<li class="empty">No supported game documents were found.</li>';
    status.textContent = `${(result.documents || []).length} document(s).`;
  } catch (error) {
    documents.innerHTML = '<li class="error">Documents are unavailable. Check that permission is still granted.</li>';
    status.textContent = error instanceof Error ? error.message : "Documents unavailable.";
  }
}

document.querySelector("#refresh").addEventListener("click", refresh);
window.addEventListener("beforeunload", () => activeObjectUrl && URL.revokeObjectURL(activeObjectUrl));
refresh();
