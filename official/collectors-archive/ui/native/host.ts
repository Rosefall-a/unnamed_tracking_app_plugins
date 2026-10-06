export interface NativeHost {
  vue: Record<string, unknown>;
  ui: Record<string, unknown>;
  host: {
    runAction(id: string, values?: Record<string, unknown>): Promise<Record<string, unknown>>;
    navigate(path: string): Promise<void>;
    confirm(options: Record<string, unknown>): Promise<boolean>;
    prompt(options: Record<string, unknown>): Promise<string | null>;
    registerSearchProvider?(provider: (query: string) => Promise<Array<{ id: string; label: string; description?: string; path: string }>>): () => void;
    registerNotificationProvider?(provider: () => Promise<Array<{ id: string; label: string; description: string; path: string }>>): () => void;
  };
}
let context: NativeHost;
export function configureHost(value: NativeHost) { context = value; }
export function host() { return context.host; }

export async function archiveAction(values: Record<string, unknown>, action = "api"): Promise<Record<string, unknown>> {
  const encoded = JSON.stringify(values).replace(/[\u0080-\uffff]/g,
    character => "\\u" + character.charCodeAt(0).toString(16).padStart(4, "0"));
  let request = values;
  let token: string | undefined;
  try {
  if (new TextEncoder().encode(encoded).length > 32_000) {
    token = crypto.randomUUID();
    const count = Math.ceil(encoded.length / 8_000);
    for (let start = 0; start < count; start += 4) {
      await Promise.all(Array.from({ length: Math.min(4, count - start) }, (_, offset) => {
        const index = start + offset;
        return host().runAction("transport-write", { token, count, index, content: encoded.slice(index * 8_000, (index + 1) * 8_000) });
      }));
    }
    request = { request_id: token };
  }
    const result = await host().runAction(action, request);
    const transfer = result.transfer as { token: string; count: number } | undefined;
    if (!transfer) return result;
    try {
      const chunks: string[] = [];
      for (let start = 0; start < transfer.count; start += 4) {
        const batch = await Promise.all(Array.from({ length: Math.min(4, transfer.count - start) },
          (_, offset) => host().runAction("transport-read", { token: transfer.token, index: start + offset })));
        chunks.push(...batch.map(chunk => String(chunk.content)));
      }
      return JSON.parse(chunks.join(""));
    } finally { await host().runAction("transport-drop", { token: transfer.token }); }
  } finally { if (token) await host().runAction("transport-drop", { token }); }
}

// These are plugin-owned record operations, dispatched by the public action API.
// No legacy host HTTP routes are called by this compatibility-shaped UI adapter.
export async function pluginRequest(path: string, options: RequestInit = {}): Promise<Response> {
  let result = await archiveAction({
    path, method: options.method ?? "GET",
    body: options.body ? JSON.parse(String(options.body)) : {},
  });
  const body = result.body;
  while (result.next_offset != null) {
    const [pathname, query] = path.split("?");
    const params = new URLSearchParams(query);
    params.set("offset", String(result.next_offset));
    result = await archiveAction({ path: pathname + "?" + params, method: "GET" });
    if (Number(result.status_code) >= 400) return new Response(JSON.stringify(result.body), { status: Number(result.status_code) });
    if (Array.isArray(body)) body.push(...result.body as unknown[]);
    else for (const key of ["bounties", "transactions"]) {
      const aggregate = body as Record<string, unknown[]>;
      const page = result.body as Record<string, unknown[]>;
      if (Array.isArray(aggregate[key])) aggregate[key].push(...page[key]);
    }
  }
  const status = Number(result.status_code ?? 200);
  return new Response(status === 204 ? null : JSON.stringify(body), { status });
}
