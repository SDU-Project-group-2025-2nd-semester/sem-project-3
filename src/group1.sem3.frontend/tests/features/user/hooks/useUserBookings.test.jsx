import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@features/user/user.services', () => ({
 getMyReservations: vi.fn(),
 getMyProfile: vi.fn(),
 deleteReservation: vi.fn(),
}));

// Default AuthContext mock returns no company (to test no-company behavior)
vi.mock('@features/auth/AuthContext', () => ({ useAuth: () => ({ currentCompany: null, isHydrating: false }) }));

import * as AuthContext from '@features/auth/AuthContext';
import * as userService from '@features/user/user.services';
import { useUserBookings } from '@features/user/hooks/useUserBookings';

beforeEach(() => vi.clearAllMocks());

test('handles no company selected state', async () => {
 const { result } = renderHook(() => useUserBookings());
 // initial state should set err when no company
 // wait until hook finishes initial async work by polling loading
 await new Promise((resolve) => {
 const interval = setInterval(() => {
 if (result.current.loading === false) {
 clearInterval(interval);
 resolve();
 }
 },20);
 });
 expect(result.current.err).toBeDefined();
});

// --- merged tests that require a company present ---

test('loads current and recent bookings and supports cancelBooking', async () => {
 // override useAuth to return a company for this test
 const authSpy = vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ currentCompany: { id:10 }, isHydrating: false });

 const now = new Date();
 const futureStart = new Date(now.getTime() +60 *60 *1000).toISOString();
 const futureEnd = new Date(now.getTime() +2 *60 *60 *1000).toISOString();
 const pastStart = new Date(now.getTime() -3 *60 *60 *1000).toISOString();
 const pastEnd = new Date(now.getTime() -2 *60 *60 *1000).toISOString();

 // reservations: one future, one past
 userService.getMyReservations.mockResolvedValueOnce([
 { id: 'r1', deskId:11, start: futureStart, end: futureEnd, deskLabel: 'D11', roomLabel: 'R1' },
 { id: 'r2', deskId:12, start: pastStart, end: pastEnd, deskLabel: 'D12', roomLabel: 'R2' },
 ]);
 userService.getMyProfile.mockResolvedValueOnce({ id: 'u1' });

 const { result } = renderHook(() => useUserBookings());

 // wait for loading to finish by polling
 await new Promise((resolve) => {
 const i = setInterval(() => {
 if (!result.current.loading) {
 clearInterval(i);
 resolve();
 }
 },10);
 });

 expect(result.current.currentBookings.length).toBe(1);
 expect(result.current.recentBookings.length).toBe(1);
 expect(result.current.profile).toBeDefined();

 // Test cancelBooking: confirm returns true
 const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
 userService.deleteReservation.mockResolvedValueOnce({});
 await act(async () => {
 await result.current.cancelBooking('r1');
 });
 expect(userService.deleteReservation).toHaveBeenCalledWith(10, 'r1');
 confirmSpy.mockRestore();
 authSpy.mockRestore();
});

test('initializes without error when company present', async () => {
 const authSpy = vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ currentCompany: { id:10 }, isHydrating: false });
 const { result } = renderHook(() => useUserBookings());
 await new Promise((resolve) => setTimeout(resolve,10));
 expect(result.current.loading).toBeDefined();
 authSpy.mockRestore();
});

// Negative tests for bookings

test('cancelBooking does not call deleteReservation when user cancels', async () => {
 const authSpy = vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ currentCompany: { id:10 }, isHydrating: false });
 userService.getMyReservations.mockResolvedValueOnce([]);
 userService.getMyProfile.mockResolvedValueOnce({ id: 'u1' });

 const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => false);
 const { result } = renderHook(() => useUserBookings());

 // wait for loading to finish
 await new Promise((resolve) => {
 const i = setInterval(() => {
 if (!result.current.loading) { clearInterval(i); resolve(); }
 },10);
 });

 await act(async () => {
 await result.current.cancelBooking('rX');
 });

 expect(userService.deleteReservation).not.toHaveBeenCalled();
 confirmSpy.mockRestore();
 authSpy.mockRestore();
});

test('cancelBooking handles deleteReservation rejection without throwing', async () => {
 const authSpy = vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ currentCompany: { id:10 }, isHydrating: false });
 const now = new Date();
 const futureStart = new Date(now.getTime() +60 *60 *1000).toISOString();
 const futureEnd = new Date(now.getTime() +2 *60 *60 *1000).toISOString();

 userService.getMyReservations.mockResolvedValueOnce([
 { id: 'r1', deskId:11, start: futureStart, end: futureEnd, deskLabel: 'D11', roomLabel: 'R1' },
 ]);
 userService.getMyProfile.mockResolvedValueOnce({ id: 'u1' });

 const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
 userService.deleteReservation.mockRejectedValueOnce(new Error('boom'));
 const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

 const { result } = renderHook(() => useUserBookings());

 // wait for load
 await new Promise((resolve) => {
 const i = setInterval(() => {
 if (!result.current.loading) { clearInterval(i); resolve(); }
 },10);
 });

 await act(async () => {
 await result.current.cancelBooking('r1');
 });

 expect(userService.deleteReservation).toHaveBeenCalled();
 expect(errorSpy).toHaveBeenCalled();

 errorSpy.mockRestore();
 confirmSpy.mockRestore();
 authSpy.mockRestore();
});
