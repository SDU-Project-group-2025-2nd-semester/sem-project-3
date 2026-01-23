/* eslint-env vitest */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

// Prevent real network fetches during tests
vi.stubGlobal('fetch', vi.fn(async () => ({
 ok: true,
 status:200,
 headers: { get: () => 'application/json' },
 json: async () => ({}),
 text: async () => '',
})));


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
 // hook signature expects single viewType
 const { result } = renderHook(() => useHealthStatsManager('company'));
 expect(typeof result.current.fetchData).toBe('function');
 // hook does not expose getTotalDeskTime/reservations in reverted version
 expect(Array.isArray(result.current.chartData)).toBe(true);
 // initial stats empty/nullable as implemented
 expect(Array.isArray(result.current.roomStats)).toBe(true);
 expect(Array.isArray(result.current.deskStats)).toBe(true);
 expect(result.current.companyStats).toBeNull();
});

