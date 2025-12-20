import { vi, test, expect, beforeEach } from 'vitest';

vi.mock('@shared/api/apiClient', () => ({
 get: vi.fn(() => Promise.resolve({})),
 post: vi.fn(() => Promise.resolve({})),
 put: vi.fn(() => Promise.resolve({})),
 del: vi.fn(() => Promise.resolve({})),
}));

import * as apiClient from '@shared/api/apiClient';
import * as staffServices from '@features/staff/staff.services';

beforeEach(() => vi.clearAllMocks());

test('rooms and desks endpoints call correct apiClient methods', async () => {
 await staffServices.getRooms(10);
 expect(apiClient.get).toHaveBeenCalledWith('/10/Rooms', undefined);

 await staffServices.getDesks(10);
 expect(apiClient.get).toHaveBeenCalledWith('/10/Desks', undefined);

 await staffServices.getDeskById(10,5);
 expect(apiClient.get).toHaveBeenCalledWith('/10/Desks/5', undefined);

 await staffServices.putDeskHeight(10,5,750);
 expect(apiClient.put).toHaveBeenCalledWith('/10/Desks/5/height',750);
});

test('damage report and profile endpoints call correct methods', async () => {
 const payload = { issue: 'x' };
 await staffServices.createDamageReport(7, payload);
 expect(apiClient.post).toHaveBeenCalledWith('/7/DamageReport', payload);

 await staffServices.getMyProfile();
 expect(apiClient.get).toHaveBeenCalledWith('/Users/me');

 const updatePayload = { firstName: 'A' };
 await staffServices.updateMyProfile(updatePayload);
 expect(apiClient.put).toHaveBeenCalledWith('/Users/me', updatePayload);
});

test('reservation endpoints call correct methods', async () => {
 await staffServices.getReservations(4);
 expect(apiClient.get).toHaveBeenCalledWith('/4/Reservation');

 await staffServices.deleteReservation(4,9);
 expect(apiClient.del).toHaveBeenCalledWith('/4/Reservation/9');
});
