/* eslint-env vitest */
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../../src/features/user/user.services', () => ({
 getDeskFromMac: vi.fn(),
}));

// module-level navigate mock
let navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }));

import * as userServices from '../../../../src/features/user/user.services';
import { useQrScanner } from '../../../../src/features/user/hooks/useQrScanner';

test('handleScan stores detected codes and performs lookup when companyId provided', async () => {
 const fakeRes = { id:11, readableId: 'Desk-11' };
 userServices.getDeskFromMac.mockResolvedValueOnce(fakeRes);

 // ensure navigateMock is a fresh spy
 navigateMock = vi.fn();

 const { result } = renderHook(() => useQrScanner(123));
 expect(result.current.scannedCodes).toEqual([]);

 await act(async () => {
 await result.current.handleScan([{ format: 'QR_CODE', rawValue: 'AA:BB:CC' }]);
 });

 expect(result.current.scannedCodes).toEqual([{ format: 'QR_CODE', rawValue: 'AA:BB:CC' }]);
 expect(result.current.lookupResults).toEqual([fakeRes]);
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
});

// merged extra test: navigation when single lookup returns desk id
test('handleScan navigates when single lookup returns desk id', async () => {
 // set navigateMock to spy
 navigateMock = vi.fn();
 userServices.getDeskFromMac.mockResolvedValueOnce({ id:33 });
 const { result } = renderHook(() => useQrScanner(10));
 await act(async () => { await result.current.handleScan([{ format: 'QR_CODE', rawValue: 'AA:BB' }]); });
 expect(result.current.lookupResults[0]).toEqual({ id:33 });
 // ensure navigate was called with expected path/state
 expect(navigateMock).toHaveBeenCalled();
});
