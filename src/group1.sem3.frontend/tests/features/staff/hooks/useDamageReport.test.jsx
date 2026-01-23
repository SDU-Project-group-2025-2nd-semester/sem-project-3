import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../../src/features/staff/staff.services', () => ({
 createDamageReport: vi.fn(),
}));

import * as staffServices from '../../../../src/features/staff/staff.services';
import { useDamageReport } from '../../../../src/features/staff/hooks/useDamageReport';

beforeEach(() => vi.clearAllMocks());

test('reports error when missing companyId or tableId', () => {
 const { result } = renderHook(() => useDamageReport(null, null, null, false));
 expect(result.current.err).toBeDefined();
});

test('submits a damage report successfully', async () => {
 const spyAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
 staffServices.createDamageReport.mockResolvedValueOnce({});

 const { result } = renderHook(() => useDamageReport(123,11,99, true));

 // set issue and description
 act(() => result.current.setIssue('Broken'));
 act(() => result.current.setDescription('Leg loose'));

 let res;
 await act(async () => {
 res = await result.current.handleSubmit({ preventDefault: () => {} });
 });

 expect(staffServices.createDamageReport).toHaveBeenCalledWith(123, expect.objectContaining({ issue: 'Broken', description: 'Leg loose', deskId:11 }));
 expect(res).toEqual({ success: true });
 spyAlert.mockRestore();
});

test('does not submit when issue is empty and alerts user', async () => {
 const spyAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
 const { result } = renderHook(() => useDamageReport(123,11,99, true));

 act(() => result.current.setIssue(' '));
 await act(async () => {
 await result.current.handleSubmit({ preventDefault: () => {} });
 });

 expect(spyAlert).toHaveBeenCalled();
 spyAlert.mockRestore();
});

