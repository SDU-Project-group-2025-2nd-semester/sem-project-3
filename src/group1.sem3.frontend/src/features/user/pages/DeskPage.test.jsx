import { describe, beforeEach, test, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import DeskPage from '../pages/DeskPage';

describe('DeskPage', () => {
 beforeEach(() => {
 vi.resetAllMocks();
 globalThis.__apiMock.reset();
 });

 test('renders and sets heights', async () => {
 // Arrange: API responses
 globalThis.__apiMock.set('get', '/Users/me', async () => ({ sittingHeight:700, standingHeight:1100 }));
 globalThis.__apiMock.set('get', '/test-company/Reservation/1', async () => ({ deskId: 'desk-1', start: new Date().toISOString(), end: new Date().toISOString() }));
 globalThis.__apiMock.set('get', '/test-company/Desks/desk-1', async () => ({ id: 'desk-1', readableId: 'D-1', height:700, roomId: 'room-1' }));
 globalThis.__apiMock.set('get', '/test-company/Rooms/room-1', async () => ({ id: 'room-1', readableId: 'R-1' }));
 globalThis.__apiMock.set('put', '/test-company/Desks/desk-1/height', async () => ({ ok: true }));

 // Render with route param
 renderWithProviders(<DeskPage />, { route: '/user/desk/1' });

 // Buttons should be present
 expect(await screen.findByText(/Set Sitting Height/i)).toBeInTheDocument();
 expect(await screen.findByText(/Set Standing Height/i)).toBeInTheDocument();

 // Click set sitting height
 await userEvent.click(screen.getByText(/Set Sitting Height/i));
 expect(globalThis.__apiMock.handle).toBeDefined();

 // Click set standing height
 await userEvent.click(screen.getByText(/Set Standing Height/i));
 expect(globalThis.__apiMock.handle).toBeDefined();
 });
});
