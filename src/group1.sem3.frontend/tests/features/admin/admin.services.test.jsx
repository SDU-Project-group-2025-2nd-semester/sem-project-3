import { vi, expect, test, beforeEach } from 'vitest';

vi.mock('@shared/api/apiClient', () => ({
 get: vi.fn(() => Promise.resolve({})),
 post: vi.fn(() => Promise.resolve({})),
 put: vi.fn(() => Promise.resolve({})),
 del: vi.fn(() => Promise.resolve({})),
}));

import * as apiClient from '@shared/api/apiClient';
import * as adminServices from '@features/admin/admin.services';

beforeEach(() => {
 vi.clearAllMocks();
});

test('getMyCompanies calls get with correct path', async () => {
 await adminServices.getMyCompanies();
 expect(apiClient.get).toHaveBeenCalledWith('/Users/me/companies');
});

test('room endpoints build correct URLs', async () => {
 await adminServices.getRooms(123);
 expect(apiClient.get).toHaveBeenCalledWith('/123/Rooms', undefined);

 await adminServices.getRoomById(123,5);
 expect(apiClient.get).toHaveBeenCalledWith('/123/Rooms/5', undefined);

 await adminServices.createRoom(123, { name: 'R' });
 expect(apiClient.post).toHaveBeenCalledWith('/123/Rooms', { name: 'R' });

 await adminServices.updateRoom(123,5, { name: 'X' });
 expect(apiClient.put).toHaveBeenCalledWith('/123/Rooms/5', { name: 'X' });

 await adminServices.setRoomHeight(123,5,1000);
 expect(apiClient.put).toHaveBeenCalledWith('/123/Rooms/5/height',1000);

 await adminServices.deleteRoom(123,5);
 expect(apiClient.del).toHaveBeenCalledWith('/123/Rooms/5');
});

test('desk endpoints build correct URLs and payloads', async () => {
 await adminServices.getDesksForRoom(7,2);
 expect(apiClient.get).toHaveBeenCalledWith('/7/Desks/room/2');

 await adminServices.getAllDesks(7);
 expect(apiClient.get).toHaveBeenCalledWith('/7/Desks');

 await adminServices.getDeskById(7,9);
 expect(apiClient.get).toHaveBeenCalledWith('/7/Desks/9', undefined);

 await adminServices.adoptDesk(7, 'AA:BB', 'RPI',2);
 // adoptDesk posts payload containing macAddress and roomId, and optionally rpiMacAddress
 expect(apiClient.post).toHaveBeenCalledWith('/7/Desks', expect.objectContaining({ macAddress: 'AA:BB', roomId:2, rpiMacAddress: 'RPI' }));

 await adminServices.unadoptDesk(7,9);
 expect(apiClient.del).toHaveBeenCalledWith('/7/Desks/9');

 await adminServices.getUnadoptedDesks(7);
 expect(apiClient.get).toHaveBeenCalledWith('/7/Desks/not-adopted');
});

test('reservation and simulator endpoints', async () => {
 await adminServices.getReservations(4);
 expect(apiClient.get).toHaveBeenCalledWith('/4/Reservation');

 await adminServices.deleteReservation(4,8);
 expect(apiClient.del).toHaveBeenCalledWith('/4/Reservation/8');

 await adminServices.getSimulatorSettings(4);
 expect(apiClient.get).toHaveBeenCalledWith('/Company/4/simulator');

 const settings = { simulatorLink: 'http://x', simulatorApiKey: 'k' };
 await adminServices.updateSimulatorSettings(4, settings);
 expect(apiClient.put).toHaveBeenCalledWith('/Company/4/simulator', settings);
});
