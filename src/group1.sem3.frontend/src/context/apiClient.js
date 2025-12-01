const BASE = (() => {
  return "https://localhost:8081/api";
})();

async function parseResponse(res) {
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try { return await res.json(); } catch { return null; }
  }
  return await res.text();
}

async function apiFetch(path, { method = "GET", headers = {}, body, credentials = "include", signal } = {}) {
  const opts = {
    method,
    headers: { Accept: "*/*", ...headers },
    credentials,
  };

  if (body !== undefined && body !== null && method !== "GET" && method !== "HEAD") {
    if (!opts.headers["Content-Type"] && !(body instanceof FormData)) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    } else {
      opts.body = body;
    }
  }

  if (signal) opts.signal = signal;

  const res = await fetch(`${BASE}${path}`, opts);

  if (!res.ok) {
    const errorBody = await parseResponse(res).catch(() => null);
    const err = new Error(`Request failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = errorBody;
    throw err;
  }

  return await parseResponse(res);
}

export default apiFetch;
export function get(path, opts) { return apiFetch(path, { method: "GET", ...opts }); }
export function post(path, body, opts) { return apiFetch(path, { method: "POST", body, ...opts }); }
export function put(path, body, opts) { return apiFetch(path, { method: "PUT", body, ...opts }); }
export function del(path, opts) { return apiFetch(path, { method: "DELETE", ...opts }); }