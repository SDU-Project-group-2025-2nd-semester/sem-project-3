import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

import { useDamagesManager } from '../../../../src/features/admin/hooks/useDamagesManager';

test('formatDate returns _ for falsy and formatted string for ISO', () => {
 const { result } = renderHook(() => useDamagesManager());
 expect(result.current.formatDate(null)).toBe('_');
 const iso = new Date('2020-01-02T12:34:00Z').toISOString();
 const formatted = result.current.formatDate(iso);
 expect(typeof formatted).toBe('string');
 expect(formatted.length).toBeGreaterThan(0);
});

test('getStatusColor and getStatusText return expected values', () => {
 const { result } = renderHook(() => useDamagesManager());
 expect(result.current.getStatusColor(true)).toBe('text-success-600');
 expect(result.current.getStatusColor(false)).toBe('text-warning-600');
 expect(result.current.getStatusText(true)).toBe('Resolved');
 expect(result.current.getStatusText(false)).toBe('Open');
});

test('exposes handler functions', () => {
 const { result } = renderHook(() => useDamagesManager());
 expect(typeof result.current.handleResolveIssue).toBe('function');
 expect(typeof result.current.handleRemoveDamage).toBe('function');
});
