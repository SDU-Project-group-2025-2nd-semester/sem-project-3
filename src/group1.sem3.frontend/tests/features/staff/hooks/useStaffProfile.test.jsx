/* eslint-env vitest */
/* global test, expect, beforeEach */
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../../src/features/staff/staff.services', () => ({
 getMyProfile: vi.fn(),
 updateMyProfile: vi.fn(),
}));

import * as staffServices from '../../../../src/features/staff/staff.services';
import { useStaffProfile } from '../../../../src/features/staff/hooks/useStaffProfile';

beforeEach(() => vi.clearAllMocks());

test('initializes with currentUser and allows saving profile', async () => {
 const currentUser = { firstName: 'A', lastName: 'B', email: 'a@b.com', userName: 'a@b.com' };
 staffServices.getMyProfile.mockResolvedValueOnce(currentUser);
 staffServices.updateMyProfile.mockResolvedValueOnce({});

 const { result } = renderHook(() => useStaffProfile(currentUser, async () => currentUser));

 // wait until hook has applied user data (polling)
 await new Promise((resolve) => {
 const interval = setInterval(() => {
 if (result.current.firstName === 'A') {
 clearInterval(interval);
 resolve();
 }
 },10);
 });

 act(() => result.current.setFirstName('X'));
 act(() => result.current.setLastName('Y'));
 act(() => result.current.setEmail('x@y.com'));

 await act(async () => { await result.current.saveProfile(); });

 expect(staffServices.updateMyProfile).toHaveBeenCalled();
});
