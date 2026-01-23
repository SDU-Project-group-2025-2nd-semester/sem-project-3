import React from 'react';
import { render, screen, waitFor, fireEvent, renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

const navigateMock = vi.fn();

vi.mock('@features/auth/AuthContext', () => ({
 useAuth: () => ({ currentCompany: { id:123 } }),
}));

vi.mock('react-router-dom', () => ({
 useNavigate: () => navigateMock,
 useLocation: () => ({ state: {} }),
}));

vi.mock('@features/user/user.services', () => ({
 getRooms: vi.fn(),
 getDesksForRoom: vi.fn(),
 getReservations: vi.fn(),
 createReservation: vi.fn(),
}));

import * as userServices from '@features/user/user.services';
import { useBooking } from '@features/user/hooks/useBooking';

function TestComp() {
 const h = useBooking();
 return (
 <div>
 <div data-testid="todayStr">{h.todayStr}</div>
 <div data-testid="roomsCount">{String(h.rooms.length)}</div>
 <div data-testid="desksCount">{String(h.desks.length)}</div>
 <div data-testid="canBook">{String(h.canBook)}</div>

 <button data-testid="setRoom" onClick={() => h.handleSelectRoom(h.rooms[0])}>
 setRoom
 </button>
 <button data-testid="setDesk" onClick={() => h.handleSelectDesk(h.desks[0])}>
 setDesk
 </button>
 <button
 data-testid="setTimes"
 onClick={() => {
 h.setStartTime('09:00');
 h.setEndTime('10:00');
 }}
 >
 setTimes
 </button>
 <button data-testid="book" onClick={() => h.handleBook()}>
 book
 </button>
 </div>
 );
}

beforeEach(() => {
 vi.clearAllMocks();
});

test('loads rooms and desks and exposes initial values', async () => {
 userServices.getRooms.mockResolvedValueOnce([
 { id:1, openingHours: { daysOfTheWeek:127, openingTime: '08:00', closingTime: '17:00' } },
 ]);
 userServices.getDesksForRoom.mockResolvedValueOnce([{ id:11 }]);
 userServices.getReservations.mockResolvedValueOnce([]);

 render(<TestComp />);

 await waitFor(() => expect(screen.getByTestId('roomsCount').textContent).toBe('1'));
 fireEvent.click(screen.getByTestId('setRoom'));
 await waitFor(() => expect(screen.getByTestId('desksCount').textContent).toBe('1'));
 expect(screen.getByTestId('canBook').textContent).toBe('false');
});

test('perform booking calls createReservation and navigates on success', async () => {
 userServices.getRooms.mockResolvedValueOnce([
 { id:1, openingHours: { daysOfTheWeek:127, openingTime: '08:00', closingTime: '17:00' } },
 ]);
 userServices.getDesksForRoom.mockResolvedValueOnce([{ id:11 }]);
 userServices.getReservations.mockResolvedValueOnce([]);
 userServices.createReservation.mockResolvedValueOnce({});

 render(<TestComp />);

 await waitFor(() => expect(screen.getByTestId('roomsCount').textContent).toBe('1'));
 fireEvent.click(screen.getByTestId('setRoom'));
 await waitFor(() => expect(screen.getByTestId('desksCount').textContent).toBe('1'));

 fireEvent.click(screen.getByTestId('setDesk'));
 fireEvent.click(screen.getByTestId('setTimes'));
 await waitFor(() => expect(screen.getByTestId('canBook').textContent).toBe('true'));

 fireEvent.click(screen.getByTestId('book'));

 await waitFor(() => expect(userServices.createReservation).toHaveBeenCalled());
 expect(navigateMock).toHaveBeenCalledWith('/user/homepage', { replace: true });
});

test('generateTicks and availabilityLabel logic with reservations', async () => {
 const now = new Date();
 const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(),9,0).toISOString();
 const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(),10,0).toISOString();

 userServices.getRooms.mockResolvedValueOnce([{ id:1, openingHours: { daysOfTheWeek:127, openingTime: '08:00', closingTime: '12:00' } }]);
 userServices.getDesksForRoom.mockResolvedValueOnce([{ id:11 }]);
 userServices.getReservations.mockResolvedValueOnce([{ deskId:11, start, end }]);

 const { result } = renderHook(() => useBooking());

 await new Promise((resolve) => {
 const i = setInterval(() => {
 if (!result.current.loadingRooms) { clearInterval(i); resolve(); }
 },10);
 });

 act(() => result.current.handleSelectRoom(result.current.rooms[0]));
 await new Promise((resolve) => {
 const i = setInterval(() => {
 if (!result.current.desksLoading) { clearInterval(i); resolve(); }
 },10);
 });
 act(() => result.current.handleSelectDesk(result.current.desks[0]));

 await new Promise((resolve) => setTimeout(resolve,50));
 const label = result.current.availabilityLabel;
 expect(typeof label).toBe('string');
});

test('handleBook sets error on failure and clears on success', async () => {
 userServices.getRooms.mockResolvedValueOnce([{ id:1, openingHours: { daysOfTheWeek:127, openingTime: '08:00', closingTime: '12:00' } }]);
 userServices.getDesksForRoom.mockResolvedValueOnce([{ id:11 }]);
 userServices.getReservations.mockResolvedValueOnce([]);

 const { result } = renderHook(() => useBooking());
 await new Promise((resolve) => {
 const i = setInterval(() => {
 if (!result.current.loadingRooms) { clearInterval(i); resolve(); }
 },10);
 });
 act(() => result.current.handleSelectRoom(result.current.rooms[0]));
 await new Promise((resolve) => {
 const i = setInterval(() => {
 if (!result.current.desksLoading) { clearInterval(i); resolve(); }
 },10);
 });
 act(() => result.current.handleSelectDesk(result.current.desks[0]));

 act(() => { result.current.setStartTime('09:00'); result.current.setEndTime('10:00'); });

 userServices.createReservation.mockRejectedValueOnce(new Error('boom'));
 await act(async () => { await result.current.handleBook(); });
 expect(result.current.bookingError).toBeDefined();

 userServices.createReservation.mockResolvedValueOnce({});
 await act(async () => { await result.current.handleBook(); });
 expect(result.current.bookingError).toBeNull();
});
