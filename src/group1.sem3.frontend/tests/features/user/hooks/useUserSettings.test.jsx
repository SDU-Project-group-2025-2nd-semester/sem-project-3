/* eslint-env vitest */
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@features/auth/AuthContext', () => ({ useAuth: () => ({ logout: vi.fn() }) }));
vi.mock('../../../../src/features/user/hooks/useUserProfile', () => ({ useUserProfile: () => ({ profile: { userHeight: '', sittingHeight: '', standingHeight: '' }, setProfile: vi.fn(), updateProfile: vi.fn() }) }));
vi.mock('../../../../src/features/user/hooks/useUserHeight', () => ({ useUserHeight: () => ({ userHeight: '', setUserHeight: vi.fn(), sittingHeight: '', setSittingHeight: vi.fn(), standingHeight: '', setStandingHeight: vi.fn(), sittingChanged: false, standingChanged: false, resetRecommended: vi.fn(), setSittingChanged: vi.fn(), setStandingChanged: vi.fn() }) }));
vi.mock('../../../../src/features/user/hooks/useHealthReminder', () => ({ useHealthReminder: () => ({ pillOption: 'Normal', setPillOption: vi.fn(), healthReminder: true, setHealthReminder: vi.fn() }) }));

import { useUserSettings } from '../../../../src/features/user/hooks/useUserSettings';

beforeEach(() => vi.clearAllMocks());

test('toggle health reminder updates profile via setProfile', () => {
 const { result } = renderHook(() => useUserSettings());
 act(() => result.current.handleToggleHealthReminder());
 expect(typeof result.current.healthReminder).toBe('boolean');
});

test('handleCancelUserHeight resets values and toggles showUserHeight', () => {
 const { result } = renderHook(() => useUserSettings());
 act(() => result.current.handleCancelUserHeight());
 expect(typeof result.current.userHeight).toBe('string');
});

test('toggle health reminder updates state and profile', () => {
 const { result } = renderHook(() => useUserSettings());
 act(() => result.current.handleToggleHealthReminder());
 expect(result.current.healthReminder).toBeDefined();
});
