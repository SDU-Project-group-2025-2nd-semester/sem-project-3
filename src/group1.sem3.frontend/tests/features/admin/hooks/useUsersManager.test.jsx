import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../../src/features/admin/admin.services', () => ({
 getUsersByCompany: vi.fn(),
 getMyProfile: vi.fn(),
 deleteUser: vi.fn(),
 getReservations: vi.fn(),
 deleteReservation: vi.fn(),
 getDeskById: vi.fn(),
 updateUserRole: vi.fn(),
}));

import * as adminServices from '../../../../src/features/admin/admin.services';
import { useUsersManager } from '../../../../src/features/admin/hooks/useUsersManager';

beforeEach(() => vi.clearAllMocks());

test('getLatestReservation returns null when none', () => {
 const { result } = renderHook(() => useUsersManager());
 expect(result.current.getLatestReservation('no-user')).toBeNull();
});

test('formatDate returns underscore for falsy and string for ISO', () => {
 const { result } = renderHook(() => useUsersManager());
 expect(result.current.formatDate(null)).toBe('_');
 const iso = new Date('2021-02-03T10:11:00Z').toISOString();
 expect(typeof result.current.formatDate(iso)).toBe('string');
});

async function waitForCompanyId(result) {
 // simple polling helper to wait for companyId to be set by the hook
 await new Promise((resolve) => {
 const interval = setInterval(() => {
 if (result.current.companyId) {
 clearInterval(interval);
 resolve();
 }
 },10);
 });
}

test('handleRemoveUser calls deleteUser when confirmed', async () => {
 adminServices.getMyProfile.mockResolvedValueOnce({ companyMemberships: [{ companyId:1 }] });
 adminServices.getUsersByCompany.mockResolvedValueOnce([]);

 const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
 adminServices.deleteUser.mockResolvedValueOnce({});

 const { result } = renderHook(() => useUsersManager());
 await waitForCompanyId(result);

 await act(async () => {
 await result.current.handleRemoveUser('u1');
 });

 expect(adminServices.deleteUser).toHaveBeenCalledWith('u1');
 confirmSpy.mockRestore();
});

test('handleRoleChange calls updateUserRole when confirmed', async () => {
 // prepare hook state with a user
 adminServices.getMyProfile.mockResolvedValueOnce({ companyMemberships: [{ companyId:1 }] });
 adminServices.getUsersByCompany.mockResolvedValueOnce([{ id: 'u2', firstName: 'X', lastName: 'Y' }]);

 const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
 adminServices.updateUserRole.mockResolvedValueOnce({});

 const { result } = renderHook(() => useUsersManager());
 await waitForCompanyId(result);

 // call role change
 await act(async () => {
 await result.current.handleRoleChange('u2',2);
 });

 expect(adminServices.updateUserRole).toHaveBeenCalled();
 confirmSpy.mockRestore();
});

// Negative tests

test('handleRemoveUser does not call deleteUser when cancelled', async () => {
 adminServices.getMyProfile.mockResolvedValueOnce({ companyMemberships: [{ companyId:1 }] });
 adminServices.getUsersByCompany.mockResolvedValueOnce([]);

 const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => false);
 adminServices.deleteUser.mockResolvedValueOnce({});

 const { result } = renderHook(() => useUsersManager());
 await waitForCompanyId(result);

 await act(async () => {
 await result.current.handleRemoveUser('u1');
 });

 expect(adminServices.deleteUser).not.toHaveBeenCalled();
 confirmSpy.mockRestore();
});

test('handleRemoveUser handles deleteUser rejection without throwing', async () => {
 adminServices.getMyProfile.mockResolvedValueOnce({ companyMemberships: [{ companyId:1 }] });
 adminServices.getUsersByCompany.mockResolvedValueOnce([]);

 const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
 adminServices.deleteUser.mockRejectedValueOnce(new Error('fail'));

 const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

 const { result } = renderHook(() => useUsersManager());
 await waitForCompanyId(result);

 // should not throw even if service rejects
 await act(async () => {
 await result.current.handleRemoveUser('u1');
 });

 expect(adminServices.deleteUser).toHaveBeenCalledWith('u1');
 expect(errorSpy).toHaveBeenCalled();

 errorSpy.mockRestore();
 confirmSpy.mockRestore();
});

test('handleRoleChange does not call updateUserRole when cancelled', async () => {
 adminServices.getMyProfile.mockResolvedValueOnce({ companyMemberships: [{ companyId:1 }] });
 adminServices.getUsersByCompany.mockResolvedValueOnce([{ id: 'u2' }]);

 const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => false);
 adminServices.updateUserRole.mockResolvedValueOnce({});

 const { result } = renderHook(() => useUsersManager());
 await waitForCompanyId(result);

 await act(async () => {
 await result.current.handleRoleChange('u2',3);
 });

 expect(adminServices.updateUserRole).not.toHaveBeenCalled();
 confirmSpy.mockRestore();
});

test('handleRoleChange handles updateUserRole rejection without throwing', async () => {
 adminServices.getMyProfile.mockResolvedValueOnce({ companyMemberships: [{ companyId:1 }] });
 adminServices.getUsersByCompany.mockResolvedValueOnce([{ id: 'u2' }]);

 const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
 adminServices.updateUserRole.mockRejectedValueOnce(new Error('err'));

 const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

 const { result } = renderHook(() => useUsersManager());
 await waitForCompanyId(result);

 await act(async () => {
 await result.current.handleRoleChange('u2',1);
 });

 expect(adminServices.updateUserRole).toHaveBeenCalled();
 expect(errorSpy).toHaveBeenCalled();

 errorSpy.mockRestore();
 confirmSpy.mockRestore();
});
