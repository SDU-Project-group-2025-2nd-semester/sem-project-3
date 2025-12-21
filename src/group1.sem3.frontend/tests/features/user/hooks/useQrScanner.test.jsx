/* eslint-env vitest */
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../../src/features/user/user.services', () => ({
 getDeskFromMac: vi.fn(),
 createReservation: vi.fn(),
}));

// module-level navigate mock
let navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));

import * as userServices from '../../../../src/features/user/user.services';
import { useQrScanner } from '../../../../src/features/user/hooks/useQrScanner';

beforeEach(() => {
 // reset mocks before each test
 vi.clearAllMocks();
 navigateMock = vi.fn();
});

test('handleScan stores detected codes and performs lookup when companyId provided', async () => {
 const fakeRes = { id:11, readableId: 'Desk-11' };
 userServices.getDeskFromMac.mockResolvedValueOnce(fakeRes);
 userServices.createReservation.mockResolvedValueOnce({ id:55 });

 // ensure navigateMock is a fresh spy
 navigateMock = vi.fn();

 const { result } = renderHook(() => useQrScanner(123));
 expect(result.current.scannedCodes).toEqual([]);

 await act(async () => {
 await result.current.handleScan([{ format: 'QR_CODE', rawValue: 'AA:BB:CC' }]);
 });

 expect(result.current.scannedCodes).toEqual([{ format: 'QR_CODE', rawValue: 'AA:BB:CC' }]);
 expect(result.current.lookupResults).toEqual([fakeRes]);
 expect(userServices.createReservation).toHaveBeenCalled();
});

test('handleScan stores detected codes but skips lookup when no companyId', async () => {
 // ensure navigateMock is a fresh spy (not used in this test)
 navigateMock = vi.fn();
 const { result } = renderHook(() => useQrScanner());

 await act(async () => {
 await result.current.handleScan([{ format: 'QR_CODE', rawValue: '1234' }]);
 });

 expect(result.current.scannedCodes).toEqual([{ format: 'QR_CODE', rawValue: '1234' }]);
 expect(result.current.lookupResults).toEqual([]);
 expect(userServices.createReservation).not.toHaveBeenCalled();
});

test('handleScan navigates when reservation created for scanned desk', async () => {
 // set navigateMock to spy
 navigateMock = vi.fn();
 userServices.getDeskFromMac.mockResolvedValueOnce({ id:33 });
 userServices.createReservation.mockResolvedValueOnce({ id:77 });
 const { result } = renderHook(() => useQrScanner(10));
 await act(async () => { await result.current.handleScan([{ format: 'QR_CODE', rawValue: 'AA:BB' }]); });
 expect(result.current.lookupResults[0]).toEqual({ id:33 });
 // ensure createReservation and navigate were called with expected path
 expect(userServices.createReservation).toHaveBeenCalled();
 expect(navigateMock).toHaveBeenCalledWith(`/user/reservation/77`);
});
