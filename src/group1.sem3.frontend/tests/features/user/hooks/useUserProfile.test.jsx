import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, afterEach, test, expect } from 'vitest';

vi.mock('../../../../src/features/user/user.services', () => ({
 getMyProfile: vi.fn(),
 updateMyProfile: vi.fn(),
}));

vi.mock('../../../../src/features/auth/AuthContext', () => ({
 useAuth: vi.fn(() => ({ currentUser: null, refreshCurrentUser: async () => null })),
}));

import * as userServices from '../../../../src/features/user/user.services';
import * as AuthContext from '../../../../src/features/auth/AuthContext';
import { useUserProfile } from '../../../../src/features/user/hooks/useUserProfile';

afterEach(() => {
 vi.clearAllMocks();
});

test('applyUser derives display values for heights and times', () => {
 const fakeUser = { firstName: 'A', lastName: 'B', email: 'a@b.com', sittingHeight:700, standingHeight:1100, sittingTime:30, standingTime:15 };
 const { result } = renderHook(() => useUserProfile());

 act(() => {
 result.current.applyUser?.(fakeUser);
 });

 expect(result.current.profile.firstName).toBe('A');
 expect(result.current.profile.sittingHeight).toBe('70');
 expect(result.current.profile.standingHeight).toBe('110');
 expect(result.current.profile.sittingTime).toBe(30);
 expect(result.current.profile.standingTime).toBe(15);
 expect(result.current.profile.password).toBe('');
});

test('applyUser maps healthRemindersFrequency and defaults healthReminder when null', () => {
 const userNull = { firstName: 'N', healthRemindersFrequency: null };
 const userZero = { firstName: 'Z', healthRemindersFrequency:0 };

 const { result } = renderHook(() => useUserProfile());

 act(() => {
 result.current.applyUser?.(userNull);
 });
 expect(result.current.profile.healthReminder).toBe(true);
 expect(result.current.profile.pillOption).toBe('Less');

 act(() => {
 result.current.applyUser?.(userZero);
 });
 expect(result.current.profile.healthReminder).toBe(false);
 expect(result.current.profile.pillOption).toBeUndefined();
});

test('showUserHeight true when heights missing and userHeight remains as current implementation', () => {
 const user = { firstName: 'H', sittingHeight: null, standingHeight: null };
 const { result } = renderHook(() => useUserProfile());

 act(() => {
 result.current.applyUser?.(user);
 });

 expect(result.current.profile.showUserHeight).toBe(true);
 expect(result.current.profile.userHeight).toBe('');
});

test('updateProfile success calls updateMyProfile with converted values and returns true', async () => {
 const baseMe = { id: 'me', userName: 'meuser' };
 userServices.getMyProfile.mockResolvedValue(baseMe);
 userServices.updateMyProfile.mockResolvedValue();

 const refreshMock = vi.fn(async () => ({}));
 AuthContext.useAuth.mockImplementation(() => ({ currentUser: null, refreshCurrentUser: refreshMock }));

 const { result } = renderHook(() => useUserProfile());

 act(() => {
 result.current.setProfile({
 firstName: 'First',
 lastName: 'Last',
 email: 'x@y.com',
 sittingHeight: '80',
 standingHeight: '120',
 sittingTime: '25',
 standingTime: '10',
 pillOption: 'Many',
 healthReminder: true,
 });
 });

 let res;
 await act(async () => {
 res = await result.current.updateProfile();
 });

 expect(res).toBe(true);
 expect(userServices.updateMyProfile).toHaveBeenCalledTimes(1);
 const payload = userServices.updateMyProfile.mock.calls[0][0];
 expect(payload.sittingHeight).toBe(800);
 expect(payload.standingHeight).toBe(1200);
 expect(payload.sittingTime).toBe(25);
 expect(payload.standingTime).toBe(10);
 expect(payload.healthRemindersFrequency).toBe(3);
 expect(payload.normalizedEmail).toBe('X@Y.COM');
 expect(payload.normalizedUserName).toBe('X@Y.COM');
 expect(refreshMock).toHaveBeenCalled();
});

test('updateProfile failure returns false when updateMyProfile throws', async () => {
 userServices.getMyProfile.mockResolvedValue({ id: 'me' });
 userServices.updateMyProfile.mockRejectedValue(new Error('boom'));

 const refreshMock = vi.fn(async () => ({}));
 AuthContext.useAuth.mockImplementation(() => ({ currentUser: null, refreshCurrentUser: refreshMock }));

 const { result } = renderHook(() => useUserProfile());

 act(() => {
 result.current.setProfile({
 firstName: 'F',
 email: 'e@e.com',
 healthReminder: false,
 pillOption: 'Normal',
 });
 });

 let res;
 await act(async () => {
 res = await result.current.updateProfile();
 });

 expect(res).toBe(false);
});

test('when currentUser is null, effect calls refreshCurrentUser and applies returned user', async () => {
 const returnedUser = { firstName: 'FromRefresh', sittingHeight:900 };
 const refreshMock = vi.fn(async () => returnedUser);
 AuthContext.useAuth.mockImplementation(() => ({ currentUser: null, refreshCurrentUser: refreshMock }));

 const { result } = renderHook(() => useUserProfile());

 await waitFor(() => {
 expect(result.current.profile.firstName).toBe('FromRefresh');
 });

 expect(refreshMock).toHaveBeenCalled();
});
