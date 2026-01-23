import { vi, test, expect, beforeEach } from 'vitest';

import * as apiClient from '@shared/api/apiClient';

beforeEach(() => {
 vi.restoreAllMocks();
});

test('get/post/put/del helpers call apiFetch with correct method', async () => {
 const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({ ok: true, status:200, headers: { get: () => 'application/json' }, json: async () => ({ hello: 'world' }) });

 await apiClient.get('/path');
 await apiClient.post('/path', { a:1 });
 await apiClient.put('/path', { b:2 });
 await apiClient.del('/path');

 fetchSpy.mockRestore();
});

test('apiFetch throws for non-ok responses and exposes status and body', async () => {
 const badResponse = { ok: false, status:401, statusText: 'Unauthorized', headers: { get: () => 'application/json' }, json: async () => ({ error: 'no' }) };
 const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(badResponse);

 await expect(apiClient.get('/path')).rejects.toHaveProperty('status',401);
 fetchSpy.mockRestore();
});

test('apiFetch handles204 No Content as null', async () => {
 const resp = { ok: true, status:204, headers: { get: () => '' }, text: async () => '' };
 const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(resp);
 const result = await apiClient.get('/nocontent');
 expect(result).toBeNull();
 fetchSpy.mockRestore();
});

test('apiFetch retries after refresh when401 and refresh succeeds', async () => {
 // Mock fetch to return401 first, then200 on retry
 const first = { ok: false, status:401, statusText: 'Unauthorized', headers: { get: () => 'application/json' }, json: async () => ({ error: 'no' }) };
 const second = { ok: true, status:200, headers: { get: () => 'application/json' }, json: async () => ({ ok: true }) };
 const fetchSpy = vi.spyOn(window, 'fetch')
 .mockResolvedValueOnce(first)
 .mockResolvedValueOnce(second);

 // Provide a refresh function that resolves true
 apiClient.setAuthHandler({ refresh: async () => true, logout: () => {} });

 const result = await apiClient.get('/retry');
 expect(result).toEqual({ ok: true });
 fetchSpy.mockRestore();
});

test('apiFetch calls logout when refresh fails', async () => {
 const first = { ok: false, status:401, statusText: 'Unauthorized', headers: { get: () => 'application/json' }, json: async () => ({ error: 'no' }) };
 const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(first);

 const logoutSpy = vi.fn();
 apiClient.setAuthHandler({ refresh: async () => false, logout: logoutSpy });

 await expect(apiClient.get('/fail')).rejects.toHaveProperty('status',401);
 expect(logoutSpy).toHaveBeenCalled();
 fetchSpy.mockRestore();
});
