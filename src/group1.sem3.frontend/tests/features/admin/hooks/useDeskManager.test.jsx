import { renderHook } from '@testing-library/react';
import { test, expect, vi } from 'vitest';

// Prevent real network fetches during tests
vi.stubGlobal('fetch', vi.fn(async () => ({
 ok: true,
 status:200,
 headers: { get: () => 'application/json' },
 json: async () => ({}),
 text: async () => '',
})));
vi.mock('../../../../src/features/admin/admin.services', () => ({
 getMyCompanies: vi.fn(() => Promise.resolve([{ companyId:1 }])),
 getRooms: vi.fn(() => Promise.resolve([])),
 getDesksForRoom: vi.fn(() => Promise.resolve([])),
 getReservations: vi.fn(() => Promise.resolve([])),
 getUnadoptedDesks: vi.fn(() => Promise.resolve([])),
 getSimulatorSettings: vi.fn(() => Promise.resolve({ simulatorLink: null })),
 adoptDesk: vi.fn(),
 unadoptDesk: vi.fn(),
 updateSimulatorSettings: vi.fn(),
 deleteRoom: vi.fn(),
 createRoom: vi.fn(),
 updateRoom: vi.fn(),
 deleteReservation: vi.fn(),
}));
import { useDesksManagerPage } from '../../../../src/features/admin/hooks/useDeskManager';

test('smoke test for useDeskManager existence', () => {
 expect(typeof useDesksManagerPage).toBe('function');
 const { result } = renderHook(() => useDesksManagerPage());
 expect(typeof result.current).toBe('object');
});

test('decodeDaysOfTheWeek returns Not set for0 and correct names for mask', () => {
 const { result } = renderHook(() => useDesksManagerPage());
 const { decodeDaysOfTheWeek } = result.current;
 expect(decodeDaysOfTheWeek(0)).toBe('Not set');
 expect(decodeDaysOfTheWeek(5)).toBe('Monday, Wednesday');
});

test('getStatusColor and getStatusText return expected values', () => {
 const { result } = renderHook(() => useDesksManagerPage());
 const { getStatusColor, getStatusText } = result.current;
 expect(getStatusColor('booked')).toBe('text-warning-600');
 expect(getStatusColor('available')).toBe('text-success-600');
 expect(getStatusColor('unavailable')).toBe('text-danger-600');
 expect(getStatusColor('unknown')).toBe('text-gray-600');

 expect(getStatusText('booked')).toBe('Booked');
 expect(getStatusText('available')).toBe('Available');
 expect(getStatusText('unavailable')).toBe('Unavailable');
 expect(getStatusText('somethingElse')).toBe('somethingElse');
});
