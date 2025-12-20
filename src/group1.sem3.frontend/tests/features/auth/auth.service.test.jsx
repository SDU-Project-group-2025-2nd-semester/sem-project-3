import { vi, test, expect, beforeEach } from 'vitest';

vi.mock('@shared/api/apiClient', () => ({
 post: vi.fn(() => Promise.resolve({})),
 get: vi.fn(() => Promise.resolve({})),
}));

import * as apiClient from '@shared/api/apiClient';
import * as authService from '@features/auth/auth.service';

beforeEach(() => vi.clearAllMocks());

test('login/signup/logout map to post calls', async () => {
 await authService.login({ email: 'a', password: 'p' });
 expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { email: 'a', password: 'p' });

 await authService.signup({ firstName: 'F', lastName: 'L', email: 'e', password: 'p' });
 expect(apiClient.post).toHaveBeenCalledWith('/auth/register', { firstName: 'F', lastName: 'L', email: 'e', password: 'p' });

 await authService.logout();
 expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
});

test('getCurrentUser calls get on /Users/me', async () => {
 await authService.getCurrentUser();
 expect(apiClient.get).toHaveBeenCalledWith('/Users/me');
});
