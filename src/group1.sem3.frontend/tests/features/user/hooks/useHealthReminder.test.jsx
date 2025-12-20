/* eslint-env vitest */
import { renderHook, act } from '@testing-library/react';
import { useHealthReminder } from '../../../../src/features/user/hooks/useHealthReminder';

test('initializes with defaults and responds to setters', () => {
 const { result } = renderHook(() => useHealthReminder());
 expect(result.current.pillOption).toBe('Normal');
 expect(result.current.healthReminder).toBe(true);

 act(() => result.current.setPillOption('Aggressive'));
 expect(result.current.pillOption).toBe('Aggressive');

 act(() => result.current.setHealthReminder(false));
 expect(result.current.healthReminder).toBe(false);
});

test('respects provided initial values', () => {
 const { result } = renderHook(() => useHealthReminder('Custom', false));
 expect(result.current.pillOption).toBe('Custom');
 expect(result.current.healthReminder).toBe(false);
});
