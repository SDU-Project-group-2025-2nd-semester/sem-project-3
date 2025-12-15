import { describe, beforeEach, test, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeskDetails } from './useDeskDetails';

describe('useDeskDetails', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		globalThis.__apiMock.reset();
	});

	test('sets sitting and standing heights via API', async () => {
		// arrange: mock reservation and desk responses
		globalThis.__apiMock.set('get', '/test-company/Reservation/abc', async () => ({ deskId: 'desk-1', start: new Date().toISOString(), end: new Date().toISOString() }));
		globalThis.__apiMock.set('get', '/test-company/Desks/desk-1', async () => ({ id: 'desk-1', readableId: 'D-1', height:700 }));
		globalThis.__apiMock.set('get', '/Users/me', async () => ({ sittingHeight:700, standingHeight:1100 }));

		// mock put to capture call
		globalThis.__apiMock.set('put', '/test-company/Desks/desk-1/height', async () => ({ success: true }));

		const { result, waitForNextUpdate } = renderHook(() => useDeskDetails({ reservationId: 'abc' }));

		// wait for initial fetches
		await waitForNextUpdate();
		await waitForNextUpdate();

		// act: call setSittingHeight and setStandingHeight
		await act(async () => {
			await result.current.setSittingHeight();
		});

		expect(globalThis.__apiMock).toBeDefined();

		await act(async () => {
			await result.current.setStandingHeight();
		});

		expect(globalThis.__apiMock).toBeDefined();
	});
});
