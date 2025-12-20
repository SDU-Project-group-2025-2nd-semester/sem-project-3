import { renderHook } from '@testing-library/react';
import { test, expect } from 'vitest';
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
