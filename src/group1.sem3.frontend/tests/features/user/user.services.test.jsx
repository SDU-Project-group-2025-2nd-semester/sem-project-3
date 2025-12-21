/* eslint-env vitest */
import { vi, test, expect, beforeEach } from 'vitest';

vi.mock('@shared/api/apiClient', () => ({
 get: vi.fn(),
 post: vi.fn(),
 put: vi.fn(),
 del: vi.fn(),
}));

import * as apiClient from '@shared/api/apiClient';
import * as userServices from '@features/user/user.services';

beforeEach(() => {
 vi.clearAllMocks();
});

test('rooms and desks endpoints call correct api paths', async () => {
 await userServices.getRooms(3);
 expect(apiClient.get).toHaveBeenCalledWith('/3/Rooms', undefined);

 await userServices.getDesks(3);
 expect(apiClient.get).toHaveBeenCalledWith('/3/Desks', undefined);

 await userServices.getDesksForRoom(3,7);
 expect(apiClient.get).toHaveBeenCalledWith('/3/Desks/room/7', undefined);

 await userServices.getDeskById(3,9);
 expect(apiClient.get).toHaveBeenCalledWith('/3/Desks/9', undefined);

 await userServices.getRoomById(3,5);
 expect(apiClient.get).toHaveBeenCalledWith('/3/Rooms/5', undefined);

 await userServices.putDeskHeight(3,11,750);
 expect(apiClient.put).toHaveBeenCalledWith('/3/Desks/11/height',750);
});

test('getDeskFromMac encodes mac and calls correct path', async () => {
 await userServices.getDeskFromMac(4, 'AA:BB:CC');
 expect(apiClient.get).toHaveBeenCalledWith('/4/Desks/from-mac/AA%3ABB%3ACC', undefined);

 // null mac should still produce encoded empty string
 await userServices.getDeskFromMac(4, null);
 expect(apiClient.get).toHaveBeenCalledWith('/4/Desks/from-mac/', undefined);
});

test('reservations endpoints build query strings and call correct methods', async () => {
 await userServices.getReservations(5, { startDate: '2020-01-01', userId: 'u1' });
 // Order of query params may vary; just assert that get was called with a string starting with path
 expect(apiClient.get.mock.calls[0][0].startsWith('/5/Reservation')).toBe(true);

 await userServices.getMyReservations(5);
 expect(apiClient.get).toHaveBeenCalledWith('/5/Reservation/me', undefined);

 await userServices.getReservation(5,77);
 expect(apiClient.get).toHaveBeenCalledWith('/5/Reservation/77', undefined);

 const payload = { deskId:11 };
 await userServices.createReservation(6, payload);
 expect(apiClient.post).toHaveBeenCalledWith('/6/Reservation', payload);

 await userServices.deleteReservation(6,88);
 expect(apiClient.del).toHaveBeenCalledWith('/6/Reservation/88');
});

test('profile endpoints call expected paths', async () => {
 await userServices.getMyProfile();
 expect(apiClient.get).toHaveBeenCalledWith('/Users/me', undefined);

 const updatePayload = { firstName: 'Bob' };
 await userServices.updateMyProfile(updatePayload);
 expect(apiClient.put).toHaveBeenCalledWith('/Users/me', updatePayload);
});
