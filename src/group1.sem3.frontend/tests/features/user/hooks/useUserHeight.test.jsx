import { renderHook, act } from '@testing-library/react';
import { useUserHeight } from '../../../../src/features/user/hooks/useUserHeight';

test('calculates recommended heights from userHeight', () => {
 const { result } = renderHook(() => useUserHeight('180'));
 expect(result.current.sittingHeight).toBeDefined();
 expect(result.current.standingHeight).toBeDefined();
});

test('resetRecommended recalculates heights', () => {
 const { result } = renderHook(() => useUserHeight('170'));
 act(() => result.current.setUserHeight('180'));
 act(() => result.current.resetRecommended());
 expect(result.current.sittingChanged).toBe(false);
});
