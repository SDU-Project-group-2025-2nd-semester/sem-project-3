/* eslint-env vitest */
/* global test, expect, beforeEach */
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../../src/features/staff/staff.services', () => ({
 getRooms: vi.fn(),
 getDesks: vi.fn(),
 putDeskHeight: vi.fn(),
}));

import * as staffServices from '../../../../src/features/staff/staff.services';
import { useRooms } from '../../../../src/features/staff/hooks/useRooms';

beforeEach(() => vi.clearAllMocks());

test('loads rooms and desks and exposes currentTables', async () => {
 staffServices.getRooms.mockResolvedValueOnce([{ id:1, readableId: 'Room A' }]);
 staffServices.getDesks.mockResolvedValueOnce([{ id:11, roomId:1, readableId: 'Desk-11' }]);

 const { result } = renderHook(() => useRooms(123));

 // wait for async effect to finish by polling
 await new Promise((resolve) => {
 const interval = setInterval(() => {
 if (Object.keys(result.current.roomsMeta).length >0) {
 clearInterval(interval);
 resolve();
 }
 },10);
 });

 expect(Object.keys(result.current.roomsMeta)).toContain('Room A');
 expect(result.current.currentTables.length).toBe(1);
});

test('updateAllDesks calls putDeskHeight and updates state', async () => {
 staffServices.getRooms.mockResolvedValueOnce([{ id:1, readableId: 'Room A' }]);
 staffServices.getDesks.mockResolvedValueOnce([{ id:11, roomId:1, readableId: 'Desk-11', maxHeight:1200, minHeight:600, height:800 }]);
 staffServices.putDeskHeight.mockResolvedValueOnce({});

 const { result } = renderHook(() => useRooms(123));

 // wait for load
 await new Promise((resolve) => {
 const interval = setInterval(() => {
 if (Object.keys(result.current.roomsMeta).length >0) {
 clearInterval(interval);
 resolve();
 }
 },10);
 });

 // perform raise action
 await act(async () => { await result.current.updateAllDesks('raise'); });
 expect(staffServices.putDeskHeight).toHaveBeenCalled();
 expect(result.current.currentTables[0].status).toBe('raised');
});

test('markDamaged toggles desk isDamaged flag', async () => {
 staffServices.getRooms.mockResolvedValueOnce([{ id:1, readableId: 'Room A' }]);
 staffServices.getDesks.mockResolvedValueOnce([{ id:11, roomId:1, readableId: 'Desk-11' }]);
 const { result } = renderHook(() => useRooms(123));

 await new Promise((resolve) => {
 const interval = setInterval(() => {
 if (Object.keys(result.current.roomsMeta).length >0) {
 clearInterval(interval);
 resolve();
 }
 },10);
 });

 act(() => result.current.markDamaged(11));
 expect(result.current.currentTables[0].isDamaged).toBe(true);
});
