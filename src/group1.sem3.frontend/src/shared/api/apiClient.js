const BASE = (() => {
    return "https://localhost:8081/api";
})();

let refreshInProgress = null;
let refreshFn = null;
let logoutFn = null;

export function setAuthHandler({ refresh, logout } = {}) {
 refreshFn = refresh || null;
 logoutFn = logout || null;
}

async function parseResponse(res) {
 if (res.status ===204) return null;
 const ct = res.headers.get("content-type") || "";
 if (ct.includes("application/json")) {
 try { return await res.json(); } catch { return null; }
 }
 return await res.text();
}

async function doFetch(url, opts) {
 return fetch(url, opts);
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

 const url = `${BASE}${path}`;

 let res = await doFetch(url, opts);

 // If unauthorized, attempt refresh flow if available
 if (res.status ===401) {
 // If a refresh handler exists, try to refresh once and then retry the request
 if (typeof refreshFn === "function") {
 try {
 if (!refreshInProgress) {
 // Begin refresh and store promise so concurrent requests wait for it
 refreshInProgress = (async () => {
 try {
 const ok = await refreshFn();
 return Boolean(ok);
 } catch {
 return false;
 } finally {
 // keep refreshInProgress until callers consume it
 }
 })();
 }

 const refreshed = await refreshInProgress;
 // Clear the in-progress marker so future401s can attempt again
 refreshInProgress = null;

 if (refreshed) {
 // retry original request once
 res = await doFetch(url, opts);
 } else {
 // Refresh failed -> call logout callback if provided
 if (typeof logoutFn === "function") {
 try { logoutFn(); } catch { /* ignore */ }
 }
 const errorBody = await parseResponse(res).catch(() => null);
 const err = new Error(`Request failed: ${res.status} ${res.statusText}`);
 err.status = res.status;
 err.body = errorBody;
 throw err;
 }
 } catch (e) {
 refreshInProgress = null;
 throw e;
 }
 }
 }

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