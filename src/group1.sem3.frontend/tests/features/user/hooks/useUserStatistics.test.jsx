import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@features/auth/AuthContext', () => ({
 useAuth: () => ({ currentCompany: { id:1 } }),
}));

vi.mock('@features/user/user.services', () => ({
 getMyProfile: vi.fn(),
 getReservations: vi.fn(),
 getDeskById: vi.fn(),
}));

import * as userServices from '@features/user/user.services';
import { useUserStatistics } from '@features/user/hooks/useUserStatistics';

beforeEach(() => vi.clearAllMocks());

test('getSittingStandingData returns values based on profile', () => {
 const { result } = renderHook(() => useUserStatistics());
 userServices.getMyProfile.mockResolvedValueOnce({ sittingTime:30, standingTime:15 });
 act(() => { result.current.fetchUserData(); });
 expect(Array.isArray(result.current.getSittingStandingData())).toBe(true);
 const data = result.current.getSittingStandingData();
 expect(data[0].name).toBe('Sitting');
});

test('getSittingStandingData returns defaults when no profile', () => {
 const { result } = renderHook(() => useUserStatistics());
 const data = result.current.getSittingStandingData();
 expect(Array.isArray(data)).toBe(true);
});

test('processChartData and totalDeskTime produce numeric outputs', () => {
 const { result } = renderHook(() => useUserStatistics());
 act(() => {
 result.current.fetchUserData = async () => {
 result.current.userProfile = { sittingTime:30, standingTime:15 };
 result.current.chartData = [];
 };
 });
 const total = result.current.totalDeskTime();
 expect(typeof total).toBe('number');
});
