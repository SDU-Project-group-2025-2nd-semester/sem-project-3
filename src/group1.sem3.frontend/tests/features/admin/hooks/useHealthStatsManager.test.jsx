/* eslint-env vitest */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@features/auth/AuthContext', () => ({
 useAuth: () => ({ currentCompany: { id:1 } }),
}));

vi.mock('../../../../src/features/admin/admin.services', () => ({
 getReservations: vi.fn(),
 getAllDesks: vi.fn(),
 getRooms: vi.fn(),
}));

import { useHealthStatsManager } from '../../../../src/features/admin/hooks/useHealthStatsManager';

beforeEach(() => vi.clearAllMocks());

test('basic smoke: hook exports and initial values', () => {
 const { result } = renderHook(() => useHealthStatsManager('daily', 'company'));
 expect(typeof result.current.fetchData).toBe('function');
 expect(typeof result.current.getTotalDeskTime).toBe('function');
 expect(Array.isArray(result.current.chartData)).toBe(true);
 const total = result.current.getTotalDeskTime();
 expect(typeof total).toBe('number');
 // initial reservations empty
 expect(Array.isArray(result.current.reservations)).toBe(true);
});
